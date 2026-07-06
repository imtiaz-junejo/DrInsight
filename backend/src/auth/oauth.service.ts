import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuthProvider, User, UserRole, UserStatus } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { OAuthEmailRequiredException } from './exceptions/oauth.exceptions';
import {
  OAuthPendingProfile,
  OAuthProfile,
  OAuthSessionPayload,
} from './interfaces/oauth-profile.interface';

const EXCHANGE_TTL_SECONDS = 120;
const EXCHANGE_KEY_PREFIX = 'oauth:exchange:';
const PENDING_TTL_SECONDS = 900;
const PENDING_KEY_PREFIX = 'oauth:pending:';

@Injectable()
export class OAuthService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private config: ConfigService,
  ) {}

  async validateOAuthUser(profile: OAuthProfile): Promise<User> {
    const existingOAuth = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerId: {
          provider: profile.provider,
          providerId: profile.providerId,
        },
      },
      include: { user: true },
    });

    if (existingOAuth) {
      return this.ensureActiveUser(existingOAuth.user, profile.avatarUrl);
    }

    const email = profile.email?.trim().toLowerCase();
    if (!email) {
      if (profile.provider === OAuthProvider.FACEBOOK) {
        const pendingCode = await this.storePendingOAuthProfile(profile);
        throw new OAuthEmailRequiredException(pendingCode);
      }

      throw new BadRequestException(
        'Your social account did not provide an email address. Please use email registration instead.',
      );
    }

    return this.createOrLinkOAuthUser(profile, email);
  }

  async completeOAuthRegistration(code: string, email: string): Promise<User> {
    const key = `${PENDING_KEY_PREFIX}${code}`;
    const stored = await this.redis.get(key);
    if (!stored) {
      throw new BadRequestException(
        'Registration session expired. Please sign in with Facebook again.',
      );
    }

    await this.redis.del(key);

    const pending = JSON.parse(stored) as OAuthPendingProfile;
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new BadRequestException('Please enter a valid email address.');
    }

    const existingOAuth = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerId: {
          provider: pending.provider,
          providerId: pending.providerId,
        },
      },
      include: { user: true },
    });

    if (existingOAuth) {
      return this.ensureActiveUser(existingOAuth.user, pending.avatarUrl);
    }

    return this.createOrLinkOAuthUser(
      {
        ...pending,
        email: normalizedEmail,
      },
      normalizedEmail,
    );
  }

  async storeExchangePayload(payload: OAuthSessionPayload): Promise<string> {
    const code = randomBytes(32).toString('hex');
    await this.redis.set(
      `${EXCHANGE_KEY_PREFIX}${code}`,
      JSON.stringify(payload),
      EXCHANGE_TTL_SECONDS,
    );
    return code;
  }

  async exchangeCode(code: string): Promise<OAuthSessionPayload> {
    const key = `${EXCHANGE_KEY_PREFIX}${code}`;
    const stored = await this.redis.get(key);
    if (!stored) {
      throw new UnauthorizedException('Invalid or expired OAuth session. Please try again.');
    }

    await this.redis.del(key);
    return JSON.parse(stored) as OAuthSessionPayload;
  }

  getFrontendUrl(): string {
    return this.config.getOrThrow<string>('FRONTEND_URL');
  }

  redirectToLogin(res: { headersSent?: boolean; redirect: (status: number, url: string) => void }, message: string) {
    if (res.headersSent) return;

    const frontendUrl = this.getFrontendUrl();
    const url = `${frontendUrl}/login?error=${encodeURIComponent(message)}`;
    res.redirect(302, url);
  }

  redirectToCompleteRegistration(
    res: { headersSent?: boolean; redirect: (status: number, url: string) => void },
    pendingCode: string,
    provider: string,
  ) {
    if (res.headersSent) return;

    const frontendUrl = this.getFrontendUrl();
    const url = `${frontendUrl}/register?oauthPending=${encodeURIComponent(pendingCode)}&provider=${encodeURIComponent(provider)}`;
    res.redirect(302, url);
  }

  private async storePendingOAuthProfile(profile: OAuthProfile): Promise<string> {
    const code = randomBytes(32).toString('hex');
    const pending: OAuthPendingProfile = {
      provider: profile.provider,
      providerId: profile.providerId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatarUrl: profile.avatarUrl,
    };

    await this.redis.set(
      `${PENDING_KEY_PREFIX}${code}`,
      JSON.stringify(pending),
      PENDING_TTL_SECONDS,
    );

    return code;
  }

  private async createOrLinkOAuthUser(profile: OAuthProfile, email: string): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      include: { oauthAccounts: true },
    });

    if (existingUser) {
      const linked = existingUser.oauthAccounts.some(
        (account) => account.provider === profile.provider,
      );

      if (!linked) {
        await this.prisma.oAuthAccount.create({
          data: {
            provider: profile.provider,
            providerId: profile.providerId,
            userId: existingUser.id,
          },
        });
      }

      return this.ensureActiveUser(existingUser, profile.avatarUrl);
    }

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          firstName: profile.firstName || 'User',
          lastName: profile.lastName || '',
          avatarUrl: profile.avatarUrl,
          emailVerified: true,
          status: UserStatus.ACTIVE,
          role: UserRole.PATIENT,
          oauthAccounts: {
            create: {
              provider: profile.provider,
              providerId: profile.providerId,
            },
          },
          patientProfile: { create: {} },
        },
      });

      return user;
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('An account with this email already exists. Please sign in instead.');
      }
      throw error;
    }
  }

  private async ensureActiveUser(user: User, avatarUrl?: string | null): Promise<User> {
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

    if (avatarUrl && !user.avatarUrl) {
      return this.prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl, emailVerified: true },
      });
    }

    if (!user.emailVerified) {
      return this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    }

    return user;
  }
}
