import { BadRequestException, Body, Controller, Get, Headers, Param, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ConsultationType, UserRole } from '@prisma/client';
import { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public, Roles } from '../common/decorators/auth.decorators';
import { PaymentsService } from './payments.service';

type RawBodyRequest = Request & { rawBody?: Buffer };

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('booking-drafts')
  @ApiBearerAuth()
  @Roles(UserRole.PATIENT)
  createBookingDraft(
    @CurrentUser('id') userId: string,
    @Body()
    body: {
      doctorId: string;
      scheduledAt: string;
      durationMinutes?: number;
      consultationType: ConsultationType;
      reason?: string;
    },
  ) {
    return this.paymentsService.createBookingDraft(userId, body);
  }

  @Post('intents')
  @ApiBearerAuth()
  @Roles(UserRole.PATIENT)
  createPaymentIntent(
    @CurrentUser('id') userId: string,
    @Body('bookingDraftId') bookingDraftId: string,
  ) {
    return this.paymentsService.createPaymentIntent(userId, bookingDraftId);
  }

  @Get('intents/:providerIntentId/status')
  @ApiBearerAuth()
  @Roles(UserRole.PATIENT)
  getPaymentStatus(
    @CurrentUser('id') userId: string,
    @Param('providerIntentId') providerIntentId: string,
  ) {
    return this.paymentsService.getPaymentStatus(userId, providerIntentId);
  }

  @Post('confirm-dev')
  @ApiBearerAuth()
  @Roles(UserRole.PATIENT)
  confirmDevPayment(
    @CurrentUser('id') userId: string,
    @Body('providerIntentId') providerIntentId: string,
  ) {
    return this.paymentsService.confirmDevPayment(userId, providerIntentId);
  }

  @Public()
  @Post('webhooks/stripe')
  handleStripeWebhook(
    @Req() request: RawBodyRequest,
    @Headers('stripe-signature') signature?: string,
  ) {
    const rawBody = request.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Raw webhook body is required');
    }

    const event = this.paymentsService.constructStripeEvent(rawBody, signature);
    return this.paymentsService.handleStripeWebhookEvent(event);
  }
}
