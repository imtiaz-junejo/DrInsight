import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { OAuthProvider } from '@prisma/client';
import { OAuthService } from '../oauth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService,
    private oauthService: OAuthService,
  ) {
    super({
      clientID: config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: config.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    return this.oauthService.validateOAuthUser({
      provider: OAuthProvider.GOOGLE,
      providerId: profile.id,
      email: profile.emails?.[0]?.value,
      firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User',
      lastName: profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '',
      avatarUrl: profile.photos?.[0]?.value,
    });
  }
}
