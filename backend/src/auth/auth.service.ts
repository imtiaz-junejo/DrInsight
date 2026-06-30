import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
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
        },
      });
    }

    if (dto.role === UserRole.PATIENT) {
      await this.prisma.patientProfile.create({ data: { userId: user.id } });
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

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

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
    return user;
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
}
