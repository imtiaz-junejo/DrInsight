import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { UserRole, UserStatus, AuditCategory, AuditResult, AuditSeverity } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { ProfileNumberService } from '../prisma/profile-number.service';
import { ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from './dto/auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import {
  getMissingProfileFields,
  isProfileComplete,
  normalizeOAuthProvider,
  validateDateOfBirth,
  validatePhoneNumber,
  type ProfileFieldKey,
  PROFILE_FIELD_LABELS,
} from './profile-completeness.util';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
const EMAIL_VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const EMAIL_VERIFICATION_RESEND_COOLDOWN_MS = 60 * 1000;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private emailService: EmailService,
    private auditLogService: AuditLogService,
    private profileNumbers: ProfileNumberService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already registered');

    if (dto.role === UserRole.ADMIN) {
      throw new BadRequestException('Cannot register as admin');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
        phone: dto.phone,
        status: dto.role === UserRole.PATIENT ? UserStatus.ACTIVE : UserStatus.PENDING,
      },
    });

    if (dto.role === UserRole.DOCTOR) {
      if (!dto.specialty || !dto.licenseNumber) {
        throw new BadRequestException('Doctors must provide specialty and license number');
      }
      await this.prisma.doctorProfile.create({
        data: {
          userId: user.id,
          specialty: dto.specialty,
          licenseNumber: dto.licenseNumber,
          doctorNumber: await this.profileNumbers.allocateDoctorNumber(),
        },
      });
    }

    if (dto.role === UserRole.PATIENT) {
      await this.prisma.patientProfile.create({
        data: {
          userId: user.id,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
          gender: dto.gender?.trim() || undefined,
          patientNumber: await this.profileNumbers.allocatePatientNumber(),
        },
      });
    }

    if (user.status !== UserStatus.ACTIVE) {
      return {
        requiresApproval: true,
        message: 'Doctor accounts require admin approval before login.',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
        },
      };
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto, ipAddress?: string) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      await this.auditLogService.log({
        actorName: 'Unknown',
        actorEmail: email,
        action: 'Failed login attempt',
        target: 'Login form',
        ipAddress,
        result: AuditResult.FAILED,
        severity: AuditSeverity.WARNING,
        category: AuditCategory.AUTH,
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'This account uses social login. Please sign in with Google or Facebook.',
      );
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      await this.auditLogService.log({
        actorUserId: user.id,
        actorName: `${user.firstName} ${user.lastName}`,
        actorRole: user.role,
        actorEmail: user.email,
        action: 'Failed login attempt',
        target: 'Login form',
        ipAddress,
        result: AuditResult.FAILED,
        severity: user.role === UserRole.ADMIN ? AuditSeverity.CRITICAL : AuditSeverity.WARNING,
        category: AuditCategory.AUTH,
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === UserStatus.PENDING) {
      throw new UnauthorizedException(
        user.role === UserRole.DOCTOR
          ? 'Your physician account is pending admin approval. You will be able to sign in once approved.'
          : 'Your account is pending activation. Please contact support.',
      );
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Your account has been suspended. Please contact support.');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Your account is not active. Please contact support.');
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  async refresh(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (
      !stored ||
      stored.revoked ||
      stored.expiresAt < new Date() ||
      stored.user.status !== UserStatus.ACTIVE
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    return this.generateTokens(stored.user.id, stored.user.email, stored.user.role);
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revoked: true },
    });
    return { success: true };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        avatarUrl: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
        doctorProfile: true,
        patientProfile: true,
      },
    });
    if (!user) throw new UnauthorizedException();

    const dateOfBirth = user.patientProfile?.dateOfBirth ?? null;
    const gender = user.patientProfile?.gender ?? null;

    return {
      ...user,
      dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : null,
      gender,
      country: user.patientProfile?.country ?? null,
      province: user.patientProfile?.province ?? null,
      city: user.patientProfile?.city ?? null,
      address: user.patientProfile?.address ?? null,
      postalCode: user.patientProfile?.postalCode ?? null,
      patientProfile: user.patientProfile
        ? {
            ...user.patientProfile,
            dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : null,
          }
        : null,
    };
  }

  async getProfileCompleteness(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        patientProfile: true,
        doctorProfile: true,
        oauthAccounts: { select: { provider: true }, take: 1, orderBy: { createdAt: 'asc' } },
      },
    });
    if (!user) throw new UnauthorizedException();

    const missingFields = getMissingProfileFields(user, user.patientProfile, user.doctorProfile);
    const profileCompleted = isProfileComplete(user, user.patientProfile, user.doctorProfile);
    const requiresCompletion = user.oauthAccounts.length > 0 && !profileCompleted;

    const dateOfBirth =
      user.role === UserRole.DOCTOR
        ? (user.doctorProfile?.dateOfBirth ?? user.patientProfile?.dateOfBirth ?? null)
        : (user.patientProfile?.dateOfBirth ?? null);
    const accountType = user.role === UserRole.DOCTOR ? 'physician' : 'patient';
    const accountSubType =
      user.role === UserRole.DOCTOR
        ? user.doctorProfile?.platformRole ?? null
        : user.patientProfile?.accountSubType ?? null;

    return {
      profileCompleted,
      requiresCompletion,
      missingFields,
      accountType,
      oauthProvider: normalizeOAuthProvider(user.oauthAccounts[0]?.provider ?? null),
      profile: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        emailVerified: user.emailVerified,
        accountSubType,
        dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : null,
        gender: user.patientProfile?.gender ?? user.doctorProfile?.gender ?? null,
        country: user.patientProfile?.country ?? user.doctorProfile?.country ?? null,
        city: user.patientProfile?.city ?? user.doctorProfile?.city ?? null,
        address: user.patientProfile?.address ?? user.doctorProfile?.address ?? null,
        bloodGroup: user.patientProfile?.bloodGroup ?? null,
        emergencyContact: user.patientProfile?.emergencyContact ?? null,
        allergies: user.patientProfile?.allergies ?? [],
        healthInterests: user.patientProfile?.healthInterests ?? [],
        contentPreference: user.patientProfile?.contentPreference ?? null,
        newsletterFrequency: user.patientProfile?.newsletterFrequency ?? null,
        languagePreference: user.patientProfile?.languagePreference ?? null,
        specialty: user.doctorProfile?.specialty ?? null,
        licenseNumber: user.doctorProfile?.licenseNumber ?? null,
        regulatoryBody: user.doctorProfile?.credentials ?? null,
        experienceYears: user.doctorProfile?.experienceYears ?? null,
        clinicalInterests: user.doctorProfile?.expertise ?? [],
        contributions: user.doctorProfile?.services ?? [],
        licenseCertificateUrl: user.doctorProfile?.licenseCertificateUrl ?? null,
        patientProfile: user.patientProfile
          ? {
              ...user.patientProfile,
              dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : null,
            }
          : null,
        doctorProfile: user.doctorProfile,
      },
    };
  }

  async completeProfile(userId: string, dto: CompleteProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true, doctorProfile: true, oauthAccounts: true },
    });
    if (!user) throw new UnauthorizedException();

    if (user.oauthAccounts.length === 0) {
      throw new BadRequestException('This endpoint is only available for social sign-in accounts.');
    }

    const targetRole = dto.accountType === 'physician' ? UserRole.DOCTOR : UserRole.PATIENT;
    const missingFields = getMissingProfileFields(
      { ...user, role: targetRole },
      user.patientProfile,
      user.doctorProfile,
    );

    if (!dto.accountSubType?.trim()) {
      throw new BadRequestException('Please select your account sub-type.');
    }

    if (dto.phone?.trim()) {
      if (!validatePhoneNumber(dto.phone)) {
        throw new BadRequestException('Please enter a valid phone number.');
      }
      const duplicatePhone = await this.prisma.user.findFirst({
        where: { phone: dto.phone.trim(), id: { not: userId } },
        select: { id: true },
      });
      if (duplicatePhone) {
        throw new ConflictException('This phone number is already registered to another account.');
      }
    }

    if (dto.emergencyContact?.trim() && !validatePhoneNumber(dto.emergencyContact)) {
      throw new BadRequestException('Please enter a valid emergency contact number.');
    }

    if (dto.dateOfBirth) {
      const dobCheck = validateDateOfBirth(dto.dateOfBirth);
      if (!dobCheck.valid) {
        throw new BadRequestException(dobCheck.message);
      }
    }

    if (targetRole === UserRole.PATIENT) {
      if (!dto.firstName?.trim() || dto.firstName.trim().toLowerCase() === 'user') {
        throw new BadRequestException('First name is required.');
      }
      if (!dto.lastName?.trim()) throw new BadRequestException('Last name is required.');
      if (!dto.phone?.trim()) throw new BadRequestException('Phone number is required.');
      if (!dto.dateOfBirth) throw new BadRequestException('Date of birth is required.');
      if (!dto.gender?.trim()) throw new BadRequestException('Gender is required.');
      if (!dto.city?.trim()) throw new BadRequestException('City is required.');
      if (!dto.country?.trim()) throw new BadRequestException('Country is required.');
      if (!dto.emergencyContact?.trim()) throw new BadRequestException('Emergency contact is required.');
      if (!dto.healthInterests?.length) {
        throw new BadRequestException('Please select at least one health interest.');
      }
      if (!dto.contentPreference?.trim()) {
        throw new BadRequestException('Preferred content type is required.');
      }
      if (!dto.newsletterFrequency?.trim()) {
        throw new BadRequestException('Newsletter frequency is required.');
      }
      if (!dto.languagePreference?.trim()) {
        throw new BadRequestException('Language preference is required.');
      }
    } else {
      if (!dto.firstName?.trim() || dto.firstName.trim().toLowerCase() === 'user') {
        throw new BadRequestException('First name is required.');
      }
      if (!dto.lastName?.trim()) throw new BadRequestException('Last name is required.');
      if (!dto.phone?.trim()) throw new BadRequestException('Phone number is required.');
      if (!dto.city?.trim()) throw new BadRequestException('City is required.');
      if (!dto.country?.trim()) throw new BadRequestException('Country is required.');
      if (!dto.dateOfBirth) throw new BadRequestException('Date of birth is required.');
      if (!dto.gender?.trim()) throw new BadRequestException('Gender is required.');
      if (!dto.specialty?.trim()) throw new BadRequestException('Specialization is required.');
      if (!dto.licenseNumber?.trim()) throw new BadRequestException('Medical license number is required.');
      if (!dto.regulatoryBody?.trim()) throw new BadRequestException('Regulatory body is required.');
      if (dto.experienceYears == null || dto.experienceYears < 0) {
        throw new BadRequestException('Years of experience is required.');
      }
      if (!dto.clinicalInterests?.length) {
        throw new BadRequestException('Please select at least one clinical interest.');
      }

      const existingLicense = await this.prisma.doctorProfile.findFirst({
        where: {
          licenseNumber: dto.licenseNumber.trim(),
          userId: { not: userId },
        },
        select: { id: true },
      });
      if (existingLicense) {
        throw new ConflictException('This medical license number is already registered.');
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          firstName: dto.firstName!.trim(),
          lastName: dto.lastName!.trim(),
          phone: dto.phone!.trim(),
          role: targetRole,
          status: targetRole === UserRole.DOCTOR ? UserStatus.PENDING : UserStatus.ACTIVE,
          profileCompletedAt: new Date(),
          ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl?.trim() || null } : {}),
        },
      });

      if (targetRole === UserRole.PATIENT) {
        const allergies = dto.allergies?.trim()
          ? dto.allergies
              .split(/[,;\n]/)
              .map((item) => item.trim())
              .filter(Boolean)
          : user.patientProfile?.allergies ?? [];

        const patientData = {
          accountSubType: dto.accountSubType!.trim(),
          dateOfBirth: new Date(dto.dateOfBirth!),
          gender: dto.gender!.trim(),
          country: dto.country!.trim(),
          city: dto.city!.trim(),
          address: dto.address?.trim() || null,
          bloodGroup: dto.bloodGroup?.trim() || null,
          emergencyContact: dto.emergencyContact!.trim(),
          allergies,
          healthInterests: dto.healthInterests ?? [],
          contentPreference: dto.contentPreference!.trim(),
          newsletterFrequency: dto.newsletterFrequency!.trim(),
          languagePreference: dto.languagePreference!.trim(),
        };

        if (user.patientProfile) {
          await tx.patientProfile.update({ where: { userId }, data: patientData });
        } else {
          await tx.patientProfile.create({
            data: {
              userId,
              patientNumber: await this.profileNumbers.allocatePatientNumber(tx),
              ...patientData,
            },
          });
        }
      } else {
        const doctorData = {
          specialty: dto.specialty!.trim(),
          licenseNumber: dto.licenseNumber!.trim(),
          credentials: dto.regulatoryBody!.trim(),
          experienceYears: dto.experienceYears ?? 0,
          expertise: dto.clinicalInterests ?? [],
          services: dto.contributions ?? [],
          platformRole: dto.accountSubType!.trim(),
          country: dto.country!.trim(),
          city: dto.city!.trim(),
          address: dto.address?.trim() || null,
          gender: dto.gender!.trim(),
          dateOfBirth: new Date(dto.dateOfBirth!),
          licenseCertificateUrl: dto.licenseCertificateUrl?.trim() || null,
        };

        if (user.doctorProfile) {
          await tx.doctorProfile.update({ where: { userId }, data: doctorData });
        } else {
          await tx.doctorProfile.create({
            data: {
              userId,
              doctorNumber: await this.profileNumbers.allocateDoctorNumber(tx),
              ...doctorData,
            },
          });
        }

        if (user.patientProfile) {
          await tx.patientProfile.update({
            where: { userId },
            data: { accountSubType: dto.accountSubType!.trim() },
          });
        } else {
          await tx.patientProfile.create({
            data: {
              userId,
              accountSubType: dto.accountSubType!.trim(),
              patientNumber: await this.profileNumbers.allocatePatientNumber(tx),
            },
          });
        }
      }
    });

    if (missingFields.length === 0) {
      return this.getProfileCompleteness(userId);
    }

    return this.getProfileCompleteness(userId);
  }

  private profileFieldLabel(field: ProfileFieldKey): string {
    return PROFILE_FIELD_LABELS[field];
  }

  async getEmailVerificationStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, emailVerified: true },
    });
    if (!user) throw new UnauthorizedException();

    if (user.emailVerified) {
      return { verified: true, email: user.email, pending: false, cooldownSeconds: 0 };
    }

    const pending = await this.prisma.emailVerificationToken.findFirst({
      where: {
        userId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    const cooldownSeconds = pending
      ? Math.max(
          0,
          Math.ceil(
            (EMAIL_VERIFICATION_RESEND_COOLDOWN_MS - (Date.now() - pending.createdAt.getTime())) / 1000,
          ),
        )
      : 0;

    return {
      verified: false,
      email: user.email,
      pending: Boolean(pending),
      cooldownSeconds,
    };
  }

  async sendEmailVerification(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, emailVerified: true },
    });
    if (!user) throw new UnauthorizedException();

    if (user.emailVerified) {
      return {
        message: 'Your email is already verified.',
        verified: true,
        cooldownSeconds: 0,
      };
    }

    const existing = await this.prisma.emailVerificationToken.findFirst({
      where: {
        userId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      const elapsed = Date.now() - existing.createdAt.getTime();
      if (elapsed < EMAIL_VERIFICATION_RESEND_COOLDOWN_MS) {
        const cooldownSeconds = Math.ceil((EMAIL_VERIFICATION_RESEND_COOLDOWN_MS - elapsed) / 1000);
        throw new BadRequestException(
          `Please wait ${cooldownSeconds} seconds before requesting another verification email.`,
        );
      }

      await this.prisma.emailVerificationToken.deleteMany({
        where: { userId, usedAt: null },
      });
    }

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_MS);

    await this.prisma.emailVerificationToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3000').replace(/\/$/, '');
    const verifyUrl = `${frontendUrl}/verify-email?token=${encodeURIComponent(rawToken)}`;

    await this.emailService.sendEmailVerificationEmail(user.email, verifyUrl);

    return {
      message: 'Verification email sent. Please check your inbox.',
      verified: false,
      cooldownSeconds: 60,
    };
  }

  async validateEmailVerificationToken(token: string) {
    const record = await this.findValidEmailVerificationToken(token);
    if (!record) {
      return { valid: false as const };
    }

    return {
      valid: true as const,
      expiresAt: record.expiresAt.toISOString(),
    };
  }

  async verifyEmail(token: string) {
    const record = await this.findValidEmailVerificationToken(token);
    if (!record) {
      throw new BadRequestException('Invalid or expired verification token.');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: true },
      }),
      this.prisma.emailVerificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.emailVerificationToken.deleteMany({
        where: {
          userId: record.userId,
          id: { not: record.id },
          usedAt: null,
        },
      }),
    ]);

    return {
      message: 'Email verified successfully.',
      verified: true,
    };
  }

  private async findValidEmailVerificationToken(token: string) {
    if (!token?.trim()) return null;

    const tokenHash = this.hashResetToken(token.trim());
    const record = await this.prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return null;
    }

    return record;
  }

  async createSessionForUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return this.generateTokens(user.id, user.email, user.role);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.trim().toLowerCase();
    this.logger.log(`forgotPassword() called for email=${email}`);

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      this.logger.log(
        `forgotPassword() — no user found for email=${email}; sendPasswordResetEmail() will NOT be called`,
      );
      throw new NotFoundException('No account exists with this email address.');
    }

    this.logger.log(`forgotPassword() — user found (id=${user.id}); generating reset token`);

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await this.prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3000').replace(/\/$/, '');
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;

    this.logger.log(`forgotPassword() — calling EmailService.sendPasswordResetEmail() for ${email}`);
    await this.emailService.sendPasswordResetEmail(email, resetUrl);
    this.logger.log(`forgotPassword() — EmailService.sendPasswordResetEmail() completed for ${email}`);

    return {
      message: 'A password reset link has been sent to your email address.',
    };
  }

  async validateResetToken(token: string) {
    const record = await this.findValidResetToken(token);
    if (!record) {
      return { valid: false as const };
    }

    return {
      valid: true as const,
      expiresAt: record.expiresAt.toISOString(),
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const record = await this.findValidResetToken(dto.token);
    if (!record) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = record.user;

    if (user.passwordHash) {
      const samePassword = await bcrypt.compare(dto.password, user.passwordHash);
      if (samePassword) {
        throw new BadRequestException('New password cannot match your previous password');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.passwordResetToken.deleteMany({
        where: { userId: user.id, id: { not: record.id } },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: user.id, revoked: false },
        data: { revoked: true },
      }),
    ]);

    return {
      message: 'Password has been reset successfully. You can now sign in with your new password.',
    };
  }

  private hashResetToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async findValidResetToken(token: string) {
    if (!token?.trim()) return null;

    const tokenHash = this.hashResetToken(token.trim());
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return null;
    }

    return record;
  }

  private async generateTokens(userId: string, email: string, role: UserRole) {
    const payload: JwtPayload = { sub: userId, email, role };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', '15m'),
    });

    const refreshToken = randomBytes(64).toString('hex');
    const expiresIn = this.config.get('JWT_REFRESH_EXPIRES_IN', '7d');
    const expiresAt = new Date();
    const days = parseInt(expiresIn.replace('d', ''), 10) || 7;
    expiresAt.setDate(expiresAt.getDate() + days);

    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId, expiresAt },
    });

    const user = await this.getProfile(userId);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true, passwordHash: true },
    });
    if (!user) throw new UnauthorizedException();

    if (!user.passwordHash) {
      throw new BadRequestException(
        'No password is set for this account. Use Forgot Password to create one first.',
      );
    }

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const samePassword = await bcrypt.compare(dto.newPassword, user.passwordHash);
    if (samePassword) {
      throw new BadRequestException('New password cannot match your current password');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId, revoked: false },
        data: { revoked: true },
      }),
    ]);

    await this.auditLogService.log({
      actorUserId: userId,
      actorName: `${user.firstName} ${user.lastName}`,
      actorRole: 'USER',
      action: 'Changed password',
      target: user.email,
      severity: AuditSeverity.SENSITIVE,
      category: AuditCategory.AUTH,
    });

    return { message: 'Password updated successfully.' };
  }
}
