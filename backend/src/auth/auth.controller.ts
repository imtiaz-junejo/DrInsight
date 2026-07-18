import { Controller, Get, Patch, Post, Body, Query, HttpCode, HttpStatus, Req, Res, UseGuards, Logger } from '@nestjs/common';import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import * as express from 'express';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { OAuthService } from './oauth.service';
import { LoginDto, RegisterDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { OAuthExchangeDto, CompleteOAuthRegistrationDto } from './dto/oauth.dto';
import { Public } from '../common/decorators/auth.decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FacebookCallbackGuard, GoogleCallbackGuard } from './guards/oauth.guards';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private oauthService: OAuthService,
  ) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto, @Req() req: express.Request) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      undefined;
    return this.authService.login(dto, ip);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    this.logger.log(`POST /auth/forgot-password received for email=${dto.email?.trim().toLowerCase()}`);
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Get('reset-password/validate')
  validateResetToken(@Query('token') token: string) {
    return this.authService.validateResetToken(token ?? '');
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth()
  me(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }

  @Get('profile-completeness')
  @ApiBearerAuth()
  profileCompleteness(@CurrentUser('id') userId: string) {
    return this.authService.getProfileCompleteness(userId);
  }

  @Patch('complete-profile')
  @ApiBearerAuth()
  completeProfile(@CurrentUser('id') userId: string, @Body() dto: CompleteProfileDto) {
    return this.authService.completeProfile(userId, dto);
  }

  @Get('email-verification/status')
  @ApiBearerAuth()
  emailVerificationStatus(@CurrentUser('id') userId: string) {
    return this.authService.getEmailVerificationStatus(userId);
  }

  @Post('email-verification/send')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  sendEmailVerification(@CurrentUser('id') userId: string) {
    return this.authService.sendEmailVerification(userId);
  }

  @Public()
  @Get('email-verification/validate')
  validateEmailVerificationToken(@Query('token') token: string) {
    return this.authService.validateEmailVerificationToken(token ?? '');
  }

  @Public()
  @Post('email-verification/verify')
  @HttpCode(HttpStatus.OK)
  verifyEmail(@Body() body: { token: string }) {
    return this.authService.verifyEmail(body.token ?? '');
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Passport redirects to Google.
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleCallbackGuard)
  async googleCallback(
    @Req() req: express.Request & { user?: User },
    @Res({ passthrough: false }) res: express.Response,
  ) {
    if (!req.user || res.headersSent) return;
    await this.completeOAuthRedirect(req.user.id, res);
  }

  @Public()
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  facebookAuth() {
    // Passport redirects to Facebook.
  }

  @Public()
  @Get('facebook/callback')
  @UseGuards(FacebookCallbackGuard)
  async facebookCallback(
    @Req() req: express.Request & { user?: User },
    @Res({ passthrough: false }) res: express.Response,
  ) {
    if (!req.user || res.headersSent) return;
    await this.completeOAuthRedirect(req.user.id, res);
  }

  @Public()
  @Post('oauth/exchange')
  @HttpCode(HttpStatus.OK)
  exchangeOAuthCode(@Body() dto: OAuthExchangeDto) {
    return this.oauthService.exchangeCode(dto.code);
  }

  @Public()
  @Post('oauth/complete-registration')
  @HttpCode(HttpStatus.OK)
  async completeOAuthRegistration(@Body() dto: CompleteOAuthRegistrationDto) {
    const user = await this.oauthService.completeOAuthRegistration(dto.code, dto.email);
    return this.authService.createSessionForUser(user.id);
  }

  private async completeOAuthRedirect(userId: string, res: express.Response) {
    const session = await this.authService.createSessionForUser(userId);
    const code = await this.oauthService.storeExchangePayload(session);
    const frontendUrl = this.oauthService.getFrontendUrl();

    if (res.headersSent) return;

    res.redirect(302, `${frontendUrl}/auth/oauth/callback?code=${encodeURIComponent(code)}`);
  }
}
