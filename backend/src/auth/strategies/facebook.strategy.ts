import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { OAuthProvider } from '@prisma/client';
import { OAuthService } from '../oauth.service';
import { resolveFacebookProfile } from '../utils/facebook-profile.util';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    config: ConfigService,
    private oauthService: OAuthService,
  ) {
    super({
      clientID: config.getOrThrow<string>('FACEBOOK_APP_ID'),
      clientSecret: config.getOrThrow<string>('FACEBOOK_APP_SECRET'),
      callbackURL: config.getOrThrow<string>('FACEBOOK_CALLBACK_URL'),
      profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
      scope: ['public_profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const resolved = await resolveFacebookProfile(profile, accessToken);

    return this.oauthService.validateOAuthUser({
      provider: OAuthProvider.FACEBOOK,
      providerId: resolved.providerId,
      email: resolved.email,
      firstName: resolved.firstName,
      lastName: resolved.lastName,
      avatarUrl: resolved.avatarUrl,
    });
  }
}
