import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ConsultationType, PaymentStatus, UserRole } from '@prisma/client';
import type { Request, Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public, Roles } from '../common/decorators/auth.decorators';
import { CreateIntentFromDraftDto, CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
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

  @Post('create-payment-intent')
  @ApiBearerAuth()
  @Roles(UserRole.PATIENT)
  createPaymentIntentDirect(
    @CurrentUser('id') userId: string,
    @Body() body: CreatePaymentIntentDto,
  ) {
    return this.paymentsService.createPaymentIntentFromDetails(userId, body);
  }

  @Post('intents')
  @ApiBearerAuth()
  @Roles(UserRole.PATIENT)
  createPaymentIntent(
    @CurrentUser('id') userId: string,
    @Body() body: CreateIntentFromDraftDto,
  ) {
    return this.paymentsService.createPaymentIntent(userId, body.bookingDraftId, {
      billingName: body.billingName,
      billingEmail: body.billingEmail,
      billingCountry: body.billingCountry,
    });
  }

  @Post('intents/:providerIntentId/verify')
  @ApiBearerAuth()
  @Roles(UserRole.PATIENT)
  verifyPayment(
    @CurrentUser('id') userId: string,
    @Param('providerIntentId') providerIntentId: string,
  ) {
    return this.paymentsService.verifyPayment(userId, providerIntentId);
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

  @Get('confirmation/:appointmentId')
  @ApiBearerAuth()
  @Roles(UserRole.PATIENT)
  getConfirmation(
    @CurrentUser('id') userId: string,
    @Param('appointmentId') appointmentId: string,
  ) {
    return this.paymentsService.getConfirmationDetails(appointmentId, userId, UserRole.PATIENT);
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

  @Get('history')
  @ApiBearerAuth()
  @Roles(UserRole.PATIENT)
  getPaymentHistory(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: PaymentStatus,
    @Query('search') search?: string,
  ) {
    return this.paymentsService.findPaymentHistory(userId, { page, limit, status, search });
  }

  @Get('earnings')
  @ApiBearerAuth()
  @Roles(UserRole.DOCTOR)
  getDoctorEarnings(@CurrentUser('id') userId: string) {
    return this.paymentsService.findDoctorEarnings(userId);
  }

  @Get('doctor/statuses')
  @ApiBearerAuth()
  @Roles(UserRole.DOCTOR)
  getDoctorPaymentStatuses(@CurrentUser('id') userId: string) {
    return this.paymentsService.findDoctorPaymentStatuses(userId);
  }

  @Get('admin/analytics')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getAdminAnalytics() {
    return this.paymentsService.getPaymentAnalytics();
  }

  @Get('admin/export')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async exportCsv(
    @Query('status') status?: PaymentStatus,
    @Query('search') search?: string,
    @Res() res?: Response,
  ) {
    const result = await this.paymentsService.exportPaymentsCsv({ status, search });
    const rows = [
      ['ID', 'Invoice', 'Patient', 'Doctor', 'Amount', 'Currency', 'Status', 'Date'].join(','),
      ...result.data.map((p) => {
        const patient = p.bookingDraft?.patient?.user;
        const doctor = p.bookingDraft?.doctor?.user;
        return [
          p.id,
          p.invoiceNumber ?? '',
          patient ? `${patient.firstName} ${patient.lastName}` : '',
          doctor ? `${doctor.firstName} ${doctor.lastName}` : '',
          (p.amountCents / 100).toFixed(2),
          p.currency,
          p.status,
          p.confirmedAt?.toISOString() ?? p.createdAt.toISOString(),
        ].join(',');
      }),
    ].join('\n');

    res!.setHeader('Content-Type', 'text/csv');
    res!.setHeader('Content-Disposition', 'attachment; filename="payments-export.csv"');
    res!.send(rows);
  }

  @Get('admin')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getAllPayments(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: PaymentStatus,
    @Query('search') search?: string,
  ) {
    return this.paymentsService.findAllPayments({ page, limit, status, search });
  }

  @Post('admin/:id/refund')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  refundPayment(@Param('id') paymentId: string, @Body('reason') reason?: string) {
    return this.paymentsService.refundPayment(paymentId, reason);
  }

  @Get(':id/invoice')
  @ApiBearerAuth()
  @Roles(UserRole.PATIENT, UserRole.ADMIN)
  async downloadInvoice(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Param('id') paymentId: string,
    @Res() res: Response,
  ) {
    const pdf = await this.paymentsService.generateInvoicePdf(paymentId, userId, role);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${paymentId}.pdf"`);
    res.send(pdf);
  }

  @Public()
  @Post('webhook')
  handleStripeWebhookAlias(
    @Req() request: RawBodyRequest,
    @Headers('stripe-signature') signature?: string,
  ) {
    return this.handleStripeWebhook(request, signature);
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
