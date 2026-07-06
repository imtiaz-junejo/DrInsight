import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { OAuthEmailRequiredException } from '../exceptions/oauth.exceptions';
import { OAuthService } from '../oauth.service';

function oauthFailureRedirect(oauthService: OAuthService, res: Response, error?: Error) {
  if (res.headersSent) return;

  const message =
    error instanceof UnauthorizedException
      ? String(error.message)
      : error?.message || 'Social sign-in failed. Please try again.';

  oauthService.redirectToLogin(res, message);
}

@Injectable()
export class GoogleCallbackGuard extends AuthGuard('google') {
  constructor(private oauthService: OAuthService) {
    super();
  }

  handleRequest<TUser>(
    err: Error | null,
    user: TUser,
    _info: unknown,
    context: ExecutionContext,
  ): TUser {
    const res = context.switchToHttp().getResponse<Response>();
    if (err || !user) {
      oauthFailureRedirect(this.oauthService, res, err || undefined);
      return null as TUser;
    }
    return user;
  }
}

@Injectable()
export class FacebookCallbackGuard extends AuthGuard('facebook') {
  constructor(private oauthService: OAuthService) {
    super();
  }

  handleRequest<TUser>(
    err: Error | null,
    user: TUser,
    _info: unknown,
    context: ExecutionContext,
  ): TUser {
    const res = context.switchToHttp().getResponse<Response>();

    if (err) {
      if (err instanceof OAuthEmailRequiredException) {
        this.oauthService.redirectToCompleteRegistration(res, err.pendingCode, 'facebook');
        return null as TUser;
      }

      oauthFailureRedirect(this.oauthService, res, err);
      return null as TUser;
    }

    if (!user) {
      oauthFailureRedirect(this.oauthService, res);
      return null as TUser;
    }

    return user;
  }
}
