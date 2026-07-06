import { HttpException, HttpStatus } from '@nestjs/common';

export class OAuthEmailRequiredException extends HttpException {
  constructor(public readonly pendingCode: string) {
    super(
      {
        message:
          'Facebook authenticated successfully, but the account does not expose an email address.',
        pendingCode,
        code: 'OAUTH_EMAIL_REQUIRED',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
