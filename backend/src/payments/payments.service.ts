import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AppointmentStatus,
  BookingDraftStatus,
  ConsultationType,
  PaymentStatus,
  Prisma,
  UserRole,
} from '@prisma/client';
import Stripe from 'stripe';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { percentChange, resolveAnalyticsRange, trendTagClass } from '../common/utils/analytics-range.util';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { InvoiceService } from './invoice.service';

export interface CreateBookingDraftInput {
  doctorId: string;
  scheduledAt: string;
  durationMinutes?: number;
  consultationType: ConsultationType;
  reason?: string;
}

const CONSULTATION_MULTIPLIER: Record<ConsultationType, number> = {
  VIDEO: 1,
  AUDIO: 0.75,
  CHAT: 0.5,
  IN_PERSON: 1,
};

const PLATFORM_FEE_CENTS = 500;
const TAX_RATE = 0.08;

export interface FeeBreakdown {
  consultationFeeCents: number;
  platformFeeCents: number;
  taxCents: number;
  totalCents: number;
}

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe | null;

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private email: EmailService,
    private invoice: InvoiceService,
    private config: ConfigService,
  ) {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    this.stripe = secretKey ? new Stripe(secretKey) : null;
  }

  calculateFees(baseFeeDollars: number, consultationType: ConsultationType): FeeBreakdown {
    const multiplier = CONSULTATION_MULTIPLIER[consultationType] ?? 1;
    const consultationFeeCents = Math.round(baseFeeDollars * multiplier * 100);
    const platformFeeCents = PLATFORM_FEE_CENTS;
    const taxCents = Math.round((consultationFeeCents + platformFeeCents) * TAX_RATE);
    const totalCents = consultationFeeCents + platformFeeCents + taxCents;
    return { consultationFeeCents, platformFeeCents, taxCents, totalCents };
  }

  async createBookingDraft(patientUserId: string, input: CreateBookingDraftInput) {
    const patient = await this.prisma.patientProfile.findUnique({
      where: { userId: patientUserId },
    });
    if (!patient) throw new BadRequestException('Patient profile required');

    const doctor = await this.prisma.doctorProfile.findUnique({
      where: { id: input.doctorId },
      include: { user: true },
    });
    if (!doctor || doctor.user.status !== 'ACTIVE') {
      throw new NotFoundException('Doctor not available');
    }

    const scheduledAt = new Date(input.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) {
      throw new BadRequestException('A future appointment time is required');
    }

    await this.assertSlotAvailable(doctor.id, scheduledAt);

    const fees = this.calculateFees(Number(doctor.consultationFee), input.consultationType);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 20);

    const existingDraft = await this.prisma.bookingDraft.findFirst({
      where: {
        patientId: patient.id,
        doctorId: doctor.id,
        scheduledAt,
        status: { in: ['DRAFT', 'PAYMENT_PENDING'] },
        expiresAt: { gt: new Date() },
      },
    });

    if (existingDraft) {
      return this.prisma.bookingDraft.update({
        where: { id: existingDraft.id },
        data: {
          consultationType: input.consultationType,
          reason: input.reason,
          amountCents: fees.totalCents,
          expiresAt,
        },
        include: {
          doctor: {
            include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
          },
        },
      });
    }

    return this.prisma.bookingDraft.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        scheduledAt,
        durationMinutes: input.durationMinutes || 30,
        consultationType: input.consultationType,
        reason: input.reason,
        amountCents: fees.totalCents,
        currency: 'usd',
        expiresAt,
      },
      include: {
        doctor: {
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
      },
    });
  }

  async createPaymentIntent(
    patientUserId: string,
    bookingDraftId: string,
    billing?: { billingName?: string; billingEmail?: string; billingCountry?: string },
  ) {
    const draft = await this.prisma.bookingDraft.findUnique({
      where: { id: bookingDraftId },
      include: { patient: true, doctor: { include: { user: true } }, payment: true },
    });
    if (!draft) throw new NotFoundException('Booking draft not found');
    if (draft.patient.userId !== patientUserId) throw new UnauthorizedException();
    if (draft.expiresAt <= new Date()) throw new BadRequestException('Booking draft expired');
    if (draft.status === BookingDraftStatus.CONFIRMED) {
      throw new BadRequestException('Booking already confirmed');
    }

    await this.assertSlotAvailable(draft.doctorId, draft.scheduledAt, draft.id);

    if (draft.payment) {
      if (billing) {
        await this.prisma.payment.update({
          where: { id: draft.payment.id },
          data: billing,
        });
      }
      return draft.payment;
    }

    const fees = this.calculateFees(Number(draft.doctor.consultationFee), draft.consultationType);
    const intent = await this.createProviderIntent(draft.id, fees.totalCents, draft.currency);

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          bookingDraftId: draft.id,
          patientId: draft.patientId,
          doctorId: draft.doctorId,
          providerIntentId: intent.providerIntentId,
          clientSecret: intent.clientSecret,
          amountCents: fees.totalCents,
          consultationFeeCents: fees.consultationFeeCents,
          platformFeeCents: fees.platformFeeCents,
          taxCents: fees.taxCents,
          currency: draft.currency,
          status: PaymentStatus.REQUIRES_PAYMENT_METHOD,
          billingName: billing?.billingName,
          billingEmail: billing?.billingEmail,
          billingCountry: billing?.billingCountry,
          metadata: {
            doctorId: draft.doctorId,
            patientId: draft.patientId,
          },
        },
      });

      await tx.bookingDraft.update({
        where: { id: draft.id },
        data: { status: BookingDraftStatus.PAYMENT_PENDING, amountCents: fees.totalCents },
      });

      return payment;
    });
  }

  async createPaymentIntentFromDetails(patientUserId: string, dto: CreatePaymentIntentDto) {
    const scheduledAt = this.parseAppointmentDateTime(dto.appointmentDate, dto.appointmentTime);
    const draft = await this.createBookingDraft(patientUserId, {
      doctorId: dto.doctorId,
      scheduledAt: scheduledAt.toISOString(),
      consultationType: dto.consultationType,
      reason: dto.reason,
      durationMinutes: dto.durationMinutes,
    });
    return this.createPaymentIntent(patientUserId, draft.id);
  }

  async verifyPayment(patientUserId: string, providerIntentId: string) {
    if (!this.stripe) throw new BadRequestException('Stripe is not configured');

    const payment = await this.prisma.payment.findUnique({
      where: { providerIntentId },
      include: { bookingDraft: { include: { patient: true } } },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.bookingDraft.patient.userId !== patientUserId) {
      throw new UnauthorizedException();
    }

    if (payment.appointmentId) {
      return this.getConfirmationDetails(payment.appointmentId, patientUserId);
    }

    const intent = await this.stripe.paymentIntents.retrieve(providerIntentId);
    if (intent.status === 'succeeded') {
      await this.processSuccessfulPayment(providerIntentId, intent);
      const updated = await this.prisma.payment.findUnique({
        where: { providerIntentId },
      });
      if (updated?.appointmentId) {
        return this.getConfirmationDetails(updated.appointmentId, patientUserId);
      }
    }

    return {
      id: payment.id,
      status: payment.status,
      appointmentId: payment.appointmentId,
      providerIntentId: payment.providerIntentId,
      stripeStatus: intent.status,
    };
  }

  async handleStripeWebhook(payload: {
    providerIntentId: string;
    status: 'succeeded' | 'failed' | 'cancelled' | 'refunded';
    chargeId?: string;
    receiptUrl?: string;
    paymentMethod?: string;
  }) {
    const payment = await this.prisma.payment.findUnique({
      where: { providerIntentId: payload.providerIntentId },
      include: {
        bookingDraft: {
          include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true } },
          },
        },
      },
    });
    if (!payment) throw new NotFoundException('Payment intent not found');

    if (payload.status === 'refunded') {
      return this.processRefund(payment.id);
    }

    if (payload.status !== 'succeeded') {
      return this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: payload.status === 'cancelled' ? PaymentStatus.CANCELLED : PaymentStatus.FAILED,
        },
      });
    }

    return this.processSuccessfulPayment(payload.providerIntentId, undefined, {
      chargeId: payload.chargeId,
      receiptUrl: payload.receiptUrl,
      paymentMethod: payload.paymentMethod,
    });
  }

  async handleStripeWebhookEvent(event: Stripe.Event) {
    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent;
      const chargeDetails = await this.extractChargeDetails(intent);
      return this.handleStripeWebhook({
        providerIntentId: intent.id,
        status: 'succeeded',
        ...chargeDetails,
      });
    }

    if (
      event.type === 'payment_intent.payment_failed' ||
      event.type === 'payment_intent.canceled'
    ) {
      const intent = event.data.object as Stripe.PaymentIntent;
      return this.handleStripeWebhook({
        providerIntentId: intent.id,
        status: event.type === 'payment_intent.canceled' ? 'cancelled' : 'failed',
      });
    }

    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge;
      const intentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
      if (intentId) {
        return this.handleStripeWebhook({ providerIntentId: intentId, status: 'refunded' });
      }
    }

    return { received: true, ignored: event.type };
  }

  async getPaymentStatus(patientUserId: string, providerIntentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { providerIntentId },
      include: {
        bookingDraft: { include: { patient: true } },
        appointment: true,
      },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.bookingDraft.patient.userId !== patientUserId) {
      throw new UnauthorizedException();
    }
    return {
      id: payment.id,
      status: payment.status,
      appointmentId: payment.appointmentId,
      providerIntentId: payment.providerIntentId,
      amountCents: payment.amountCents,
      currency: payment.currency,
    };
  }

  async getConfirmationDetails(appointmentId: string, userId: string, role?: UserRole) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        patient: { include: { user: { select: { firstName: true, lastName: true, email: true, id: true } } } },
        payment: true,
      },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    if (role === UserRole.PATIENT || !role) {
      if (appointment.patient.user.id !== userId) throw new UnauthorizedException();
    }

    const payment = appointment.payment;
    return {
      appointmentId: appointment.id,
      doctor: `${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`,
      specialty: appointment.doctor.specialty,
      patient: `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`,
      scheduledAt: appointment.scheduledAt,
      consultationType: appointment.consultationType,
      status: appointment.status,
      amountPaid: payment ? payment.amountCents / 100 : 0,
      currency: payment?.currency ?? 'usd',
      paymentStatus: payment?.status ?? 'UNKNOWN',
      transactionId: payment?.providerIntentId ?? null,
      receiptUrl: payment?.receiptUrl ?? null,
      invoiceNumber: payment?.invoiceNumber ?? null,
      paymentId: payment?.id ?? null,
    };
  }

  async confirmDevPayment(patientUserId: string, providerIntentId: string) {
    if (this.config.get('NODE_ENV') === 'production' && this.config.get('ALLOW_DEV_PAYMENT') !== 'true') {
      throw new BadRequestException('Dev payment confirmation is disabled in production');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { providerIntentId },
      include: { bookingDraft: { include: { patient: true } } },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.bookingDraft.patient.userId !== patientUserId) {
      throw new UnauthorizedException();
    }

    return this.handleStripeWebhook({ providerIntentId, status: 'succeeded' });
  }

  async findPaymentHistory(
    patientUserId: string,
    query: { page?: number; limit?: number; status?: PaymentStatus; search?: string },
  ) {
    const patient = await this.prisma.patientProfile.findUnique({ where: { userId: patientUserId } });
    if (!patient) return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {
      patientId: patient.id,
      status: { in: ['SUCCEEDED', 'REFUNDED', 'FAILED', 'CANCELLED', 'REQUIRES_PAYMENT_METHOD', 'PROCESSING'] },
    };

    if (query.status) where.status = query.status;

    if (query.search) {
      where.OR = [
        { invoiceNumber: { contains: query.search, mode: 'insensitive' } },
        { providerIntentId: { contains: query.search, mode: 'insensitive' } },
        { bookingDraft: { doctor: { user: { lastName: { contains: query.search, mode: 'insensitive' } } } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          appointment: {
            include: {
              doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
            },
          },
          bookingDraft: { include: { doctor: { include: { user: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findDoctorPaymentStatuses(doctorUserId: string) {
    const doctor = await this.prisma.doctorProfile.findUnique({ where: { userId: doctorUserId } });
    if (!doctor) return [];

    const payments = await this.prisma.payment.findMany({
      where: { doctorId: doctor.id, appointmentId: { not: null } },
      select: {
        id: true,
        status: true,
        amountCents: true,
        currency: true,
        confirmedAt: true,
        appointmentId: true,
        appointment: { select: { scheduledAt: true, consultationType: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return payments.map((p) => ({
      appointmentId: p.appointmentId,
      paymentStatus: this.displayPaymentStatus(p.status),
      amountCents: p.amountCents,
      currency: p.currency,
      scheduledAt: p.appointment?.scheduledAt,
      consultationType: p.appointment?.consultationType,
      appointmentStatus: p.appointment?.status,
    }));
  }

  async findAllPayments(query: {
    page?: number;
    limit?: number;
    status?: PaymentStatus;
    search?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { invoiceNumber: { contains: query.search, mode: 'insensitive' } },
        { providerIntentId: { contains: query.search, mode: 'insensitive' } },
        { billingEmail: { contains: query.search, mode: 'insensitive' } },
        { bookingDraft: { patient: { user: { email: { contains: query.search, mode: 'insensitive' } } } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          bookingDraft: {
            include: {
              doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
              patient: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
            },
          },
          appointment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getPaymentAnalytics(query: { range?: string; from?: string; to?: string } = {}) {
    const range = resolveAnalyticsRange(query);
    const dateFilter = { gte: range.start, lte: range.end };
    const prevDateFilter = { gte: range.prevStart, lte: range.prevEnd };

    const [all, succeeded, failed, pending, refunded, succeededPayments, prevSucceededPayments] =
      await Promise.all([
        this.prisma.payment.count({ where: { createdAt: dateFilter } }),
        this.prisma.payment.count({ where: { status: 'SUCCEEDED', confirmedAt: dateFilter } }),
        this.prisma.payment.count({ where: { status: 'FAILED', createdAt: dateFilter } }),
        this.prisma.payment.count({
          where: {
            status: { in: ['REQUIRES_PAYMENT_METHOD', 'REQUIRES_CONFIRMATION', 'PROCESSING'] },
            createdAt: dateFilter,
          },
        }),
        this.prisma.payment.count({ where: { status: 'REFUNDED', updatedAt: dateFilter } }),
        this.prisma.payment.findMany({
          where: { status: 'SUCCEEDED', confirmedAt: dateFilter },
          select: {
            amountCents: true,
            consultationFeeCents: true,
            platformFeeCents: true,
            taxCents: true,
            confirmedAt: true,
            doctorId: true,
          },
        }),
        this.prisma.payment.aggregate({
          where: { status: 'SUCCEEDED', confirmedAt: prevDateFilter },
          _sum: { amountCents: true },
        }),
      ]);

    const doctorIds = [...new Set(succeededPayments.map((p) => p.doctorId).filter((id): id is string => !!id))];
    const doctors = doctorIds.length
      ? await this.prisma.doctorProfile.findMany({
          where: { id: { in: doctorIds } },
          select: {
            id: true,
            specialty: true,
            user: { select: { firstName: true, lastName: true } },
          },
        })
      : [];
    const doctorById = new Map(doctors.map((d) => [d.id, d]));

    const totalRevenueCents = succeededPayments.reduce((s, p) => s + p.amountCents, 0);
    const prevRevenueCents = prevSucceededPayments._sum.amountCents ?? 0;
    const consultationRevenueCents = succeededPayments.reduce((s, p) => s + p.consultationFeeCents, 0);
    const platformFeesCents = succeededPayments.reduce((s, p) => s + p.platformFeeCents, 0);
    const successRate = all > 0 ? Math.round((succeeded / all) * 100) : 0;

    const monthlyMap = new Map<string, number>();
    const dailyMap = new Map<string, number>();

    for (const p of succeededPayments) {
      if (!p.confirmedAt) continue;
      const monthKey = p.confirmedAt.toLocaleDateString('en-US', { month: 'short' });
      const dayKey = p.confirmedAt.toISOString().slice(0, 10);
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + p.amountCents);
      dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + p.amountCents);
    }

    const monthlyRevenue = Array.from(monthlyMap.entries()).map(([month, amountCents]) => ({
      month,
      amountCents,
    }));

    const dailyRevenue = Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, amountCents]) => ({ day, amountCents }));

    const doctorPayoutMap = new Map<
      string,
      { doctorName: string; specialty: string; amountCents: number; period: string; status: string }
    >();

    for (const payment of succeededPayments) {
      if (!payment.doctorId) continue;
      const doctor = doctorById.get(payment.doctorId);
      if (!doctor) continue;
      const period = payment.confirmedAt
        ? payment.confirmedAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : '—';
      const existing = doctorPayoutMap.get(payment.doctorId);
      const due = payment.consultationFeeCents || 0;
      const doctorName = `Dr. ${doctor.user.firstName} ${doctor.user.lastName}`;
      if (existing) {
        existing.amountCents += due;
      } else {
        doctorPayoutMap.set(payment.doctorId, {
          doctorName,
          specialty: doctor.specialty,
          amountCents: due,
          period,
          status: 'Paid',
        });
      }
    }

    const pendingPayouts = Array.from(doctorPayoutMap.values())
      .sort((a, b) => b.amountCents - a.amountCents)
      .slice(0, 20);

    const revenueChange = percentChange(totalRevenueCents, prevRevenueCents);
    const consultationShare =
      totalRevenueCents > 0
        ? Math.round((consultationRevenueCents / totalRevenueCents) * 1000) / 10
        : 0;
    const platformShare =
      totalRevenueCents > 0 ? Math.round((platformFeesCents / totalRevenueCents) * 1000) / 10 : 0;

    return {
      range: range.key,
      totalPayments: all,
      succeededPayments: succeeded,
      failedPayments: failed,
      pendingPayments: pending,
      refundedPayments: refunded,
      totalRevenueCents,
      consultationRevenueCents,
      platformFeesCents,
      successRate,
      monthlyRevenue,
      dailyRevenue,
      pendingPayouts,
      stats: {
        revenueChange,
        revenueTag: `${revenueChange >= 0 ? '+' : ''}${revenueChange}%`,
        revenueTagClass: trendTagClass(revenueChange),
        consultationShare: `${consultationShare}%`,
        platformShare: `${platformShare}%`,
      },
    };
  }

  async refundPayment(paymentId: string, reason?: string) {
    if (!this.stripe) throw new BadRequestException('Stripe is not configured');

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        bookingDraft: {
          include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true } },
          },
        },
        appointment: true,
      },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== PaymentStatus.SUCCEEDED) {
      throw new BadRequestException('Only succeeded payments can be refunded');
    }

    await this.stripe.refunds.create({
      payment_intent: payment.providerIntentId,
      reason: 'requested_by_customer',
      metadata: reason ? { reason } : undefined,
    });

    return this.processRefund(payment.id, reason);
  }

  async generateInvoicePdf(paymentId: string, userId: string, role: UserRole) {
    const payment = await this.getPaymentForUser(paymentId, userId, role);
    const data = await this.buildInvoiceData(payment);
    return this.invoice.generateInvoicePdf(data);
  }

  async findDoctorEarnings(doctorUserId: string) {
    const doctor = await this.prisma.doctorProfile.findUnique({ where: { userId: doctorUserId } });
    if (!doctor) return { totalCents: 0, monthly: [] };

    const payments = await this.prisma.payment.findMany({
      where: {
        status: 'SUCCEEDED',
        doctorId: doctor.id,
      },
      select: { amountCents: true, confirmedAt: true },
      orderBy: { confirmedAt: 'asc' },
    });

    const totalCents = payments.reduce((sum, p) => sum + p.amountCents, 0);
    const monthlyMap = new Map<string, number>();

    for (const p of payments) {
      if (!p.confirmedAt) continue;
      const key = `${p.confirmedAt.getFullYear()}-${String(p.confirmedAt.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + p.amountCents);
    }

    const monthly = Array.from(monthlyMap.entries())
      .slice(-6)
      .map(([month, amountCents]) => ({ month, amountCents }));

    return { totalCents, monthly, paymentCount: payments.length };
  }

  constructStripeEvent(rawBody: Buffer | string, signature?: string | string[]) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new BadRequestException('Stripe webhook secret is not configured');
    }

    if (!signature || Array.isArray(signature)) {
      throw new BadRequestException('Stripe signature header is required');
    }

    try {
      return this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }
  }

  exportPaymentsCsv(query: { status?: PaymentStatus; search?: string }) {
    return this.findAllPayments({ ...query, page: 1, limit: 10000 });
  }

  private async processSuccessfulPayment(
    providerIntentId: string,
    intent?: Stripe.PaymentIntent,
    extras?: { chargeId?: string; receiptUrl?: string; paymentMethod?: string },
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { providerIntentId },
      include: {
        bookingDraft: {
          include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true } },
          },
        },
      },
    });
    if (!payment) throw new NotFoundException('Payment intent not found');
    if (payment.appointmentId) return payment;

    await this.assertSlotAvailable(payment.bookingDraft.doctorId, payment.bookingDraft.scheduledAt, payment.bookingDraftId);

    let chargeId = extras?.chargeId;
    let receiptUrl = extras?.receiptUrl;
    let paymentMethod = extras?.paymentMethod;

    if (this.stripe && (!chargeId || !receiptUrl)) {
      const stripeIntent = intent ?? (await this.stripe.paymentIntents.retrieve(providerIntentId, {
        expand: ['latest_charge', 'payment_method'],
      }));
      const details = await this.extractChargeDetails(stripeIntent);
      chargeId = chargeId ?? details.chargeId;
      receiptUrl = receiptUrl ?? details.receiptUrl;
      paymentMethod = paymentMethod ?? details.paymentMethod;
    }

    const invoiceNumber = payment.invoiceNumber ?? this.generateInvoiceNumber();

    const confirmed = await this.prisma.$transaction(async (tx) => {
      const roomId = `room_${payment.bookingDraft.id}`;
      const appointment = await tx.appointment.create({
        data: {
          patientId: payment.bookingDraft.patientId,
          doctorId: payment.bookingDraft.doctorId,
          scheduledAt: payment.bookingDraft.scheduledAt,
          durationMinutes: payment.bookingDraft.durationMinutes,
          consultationType: payment.bookingDraft.consultationType,
          reason: payment.bookingDraft.reason,
          status: AppointmentStatus.CONFIRMED,
          meetingRoomId: roomId,
          roomId,
          meetingStatus: 'WAITING',
        },
      });

      await tx.conversation.upsert({
        where: {
          patientId_doctorId: {
            patientId: payment.bookingDraft.patientId,
            doctorId: payment.bookingDraft.doctorId,
          },
        },
        update: { appointmentId: appointment.id },
        create: {
          patientId: payment.bookingDraft.patientId,
          doctorId: payment.bookingDraft.doctorId,
          appointmentId: appointment.id,
        },
      });

      await tx.bookingDraft.update({
        where: { id: payment.bookingDraftId },
        data: { status: BookingDraftStatus.CONFIRMED },
      });

      return tx.payment.update({
        where: { id: payment.id },
        data: {
          appointmentId: appointment.id,
          status: PaymentStatus.SUCCEEDED,
          confirmedAt: new Date(),
          stripeChargeId: chargeId,
          receiptUrl,
          paymentMethod,
          invoiceNumber,
        },
        include: {
          appointment: true,
          bookingDraft: {
            include: {
              patient: { include: { user: true } },
              doctor: { include: { user: true } },
            },
          },
        },
      });
    });

    await this.sendSuccessNotifications(confirmed);
    return confirmed;
  }

  private async processRefund(paymentId: string, reason?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        bookingDraft: {
          include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true } },
          },
        },
        appointment: true,
      },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    const updated = await this.prisma.$transaction(async (tx) => {
      if (payment.appointmentId) {
        await tx.appointment.update({
          where: { id: payment.appointmentId },
          data: { status: AppointmentStatus.CANCELLED, cancelledAt: new Date(), cancelReason: reason ?? 'Refunded' },
        });
      }
      return tx.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.REFUNDED },
      });
    });

    await this.notifications.create(payment.bookingDraft.patient.userId, {
      type: 'APPOINTMENT',
      title: 'Payment refunded',
      body: 'Your consultation payment has been refunded.',
      data: { paymentId, appointmentId: payment.appointmentId },
    });

    return updated;
  }

  private async sendSuccessNotifications(payment: {
    id: string;
    appointmentId: string | null;
    amountCents: number;
    currency: string;
    providerIntentId: string;
    receiptUrl: string | null;
    invoiceNumber: string | null;
    bookingDraft: {
      consultationType: ConsultationType;
      patient: { user: { id: string; email: string; firstName: string; lastName: string } };
      doctor: { user: { id: string; firstName: string; lastName: string }; specialty: string };
      scheduledAt: Date;
    };
  }) {
    const { bookingDraft } = payment;

    await this.notifications.create(bookingDraft.doctor.user.id, {
      type: 'APPOINTMENT',
      title: 'New paid appointment',
      body: `A ${bookingDraft.consultationType} consultation has been confirmed and paid.`,
      data: { appointmentId: payment.appointmentId },
    });

    await this.notifications.create(bookingDraft.patient.user.id, {
      type: 'APPOINTMENT',
      title: 'Appointment confirmed',
      body: 'Your payment was successful and your consultation is confirmed.',
      data: { appointmentId: payment.appointmentId, paymentId: payment.id },
    });

    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN', status: 'ACTIVE' },
      select: { id: true },
    });
    for (const admin of admins) {
      await this.notifications.create(admin.id, {
        type: 'SYSTEM',
        title: 'Payment received',
        body: `Payment of $${(payment.amountCents / 100).toFixed(2)} for ${bookingDraft.doctor.user.firstName} ${bookingDraft.doctor.user.lastName}`,
        data: { paymentId: payment.id, appointmentId: payment.appointmentId },
      });
    }

    const patientEmail = payment.bookingDraft.patient.user.email;
    const doctorName = `${bookingDraft.doctor.user.firstName} ${bookingDraft.doctor.user.lastName}`;
    const amount = `$${(payment.amountCents / 100).toFixed(2)}`;

    await this.email.sendPaymentConfirmation(patientEmail, {
      patientName: `${bookingDraft.patient.user.firstName} ${bookingDraft.patient.user.lastName}`,
      doctorName,
      specialty: bookingDraft.doctor.specialty,
      scheduledAt: bookingDraft.scheduledAt,
      amount,
      transactionId: payment.providerIntentId,
      receiptUrl: payment.receiptUrl,
    });
  }

  private async assertSlotAvailable(doctorId: string, scheduledAt: Date, excludeDraftId?: string) {
    const existing = await this.prisma.appointment.findFirst({
      where: {
        doctorId,
        scheduledAt,
        status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
      },
    });
    if (existing) throw new BadRequestException('Selected appointment slot is no longer available');

    const pendingDraft = await this.prisma.bookingDraft.findFirst({
      where: {
        doctorId,
        scheduledAt,
        status: { in: ['PAYMENT_PENDING', 'DRAFT'] },
        expiresAt: { gt: new Date() },
        ...(excludeDraftId ? { id: { not: excludeDraftId } } : {}),
      },
    });
    if (pendingDraft) {
      throw new BadRequestException('Selected appointment slot is being booked by another patient');
    }
  }

  private async createProviderIntent(bookingDraftId: string, amountCents: number, currency: string) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe payments are not configured');
    }

    const intent = await this.stripe.paymentIntents.create(
      {
        amount: amountCents,
        currency,
        metadata: { bookingDraftId },
        automatic_payment_methods: { enabled: true },
      },
      { idempotencyKey: `draft_${bookingDraftId}` },
    );

    if (!intent.client_secret) {
      throw new BadRequestException('Unable to create payment intent');
    }

    return {
      providerIntentId: intent.id,
      clientSecret: intent.client_secret,
    };
  }

  private async extractChargeDetails(intent: Stripe.PaymentIntent) {
    let chargeId: string | undefined;
    let receiptUrl: string | undefined;
    let paymentMethod: string | undefined;

    const charge = intent.latest_charge;
    if (typeof charge === 'object' && charge) {
      chargeId = charge.id;
      receiptUrl = charge.receipt_url ?? undefined;
    } else if (typeof charge === 'string') {
      chargeId = charge;
    }

    const pm = intent.payment_method;
    if (typeof pm === 'object' && pm) {
      paymentMethod = pm.type;
      if (pm.card) {
        paymentMethod = `${pm.card.brand} •••• ${pm.card.last4}`;
      }
    }

    return { chargeId, receiptUrl, paymentMethod };
  }

  private parseAppointmentDateTime(dateStr: string, timeStr: string): Date {
    const scheduledAt = new Date(`${dateStr}T${timeStr}`);
    if (Number.isNaN(scheduledAt.getTime())) {
      throw new BadRequestException('Invalid appointment date or time');
    }
    return scheduledAt;
  }

  private generateInvoiceNumber(): string {
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `INV-${stamp}-${rand}`;
  }

  private displayPaymentStatus(status: PaymentStatus): string {
    const map: Record<PaymentStatus, string> = {
      REQUIRES_PAYMENT_METHOD: 'Pending',
      REQUIRES_CONFIRMATION: 'Pending',
      PROCESSING: 'Pending',
      SUCCEEDED: 'Paid',
      FAILED: 'Failed',
      CANCELLED: 'Cancelled',
      REFUNDED: 'Refunded',
    };
    return map[status] ?? status;
  }

  private async getPaymentForUser(paymentId: string, userId: string, role: UserRole) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        bookingDraft: {
          include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true } },
          },
        },
        appointment: true,
      },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    if (role === UserRole.PATIENT) {
      if (payment.bookingDraft.patient.userId !== userId) throw new UnauthorizedException();
    } else if (role === UserRole.DOCTOR) {
      if (payment.bookingDraft.doctor.userId !== userId) throw new UnauthorizedException();
    }

    return payment;
  }

  private async buildInvoiceData(payment: Awaited<ReturnType<typeof this.getPaymentForUser>>) {
    const draft = payment.bookingDraft;
    const scheduled = draft.scheduledAt;
    return {
      invoiceNumber: payment.invoiceNumber ?? payment.id.slice(0, 12).toUpperCase(),
      patientName: `${draft.patient.user.firstName} ${draft.patient.user.lastName}`,
      patientEmail: draft.patient.user.email,
      doctorName: `Dr. ${draft.doctor.user.firstName} ${draft.doctor.user.lastName}`,
      doctorSpecialty: draft.doctor.specialty,
      appointmentDate: scheduled.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      appointmentTime: scheduled.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      consultationType: draft.consultationType,
      consultationFee: `$${(payment.consultationFeeCents / 100).toFixed(2)}`,
      platformFee: `$${(payment.platformFeeCents / 100).toFixed(2)}`,
      tax: `$${(payment.taxCents / 100).toFixed(2)}`,
      total: `$${(payment.amountCents / 100).toFixed(2)}`,
      currency: payment.currency.toUpperCase(),
      transactionId: payment.providerIntentId,
      status: this.displayPaymentStatus(payment.status),
      receiptUrl: payment.receiptUrl,
      paidAt: (payment.confirmedAt ?? payment.createdAt).toLocaleString('en-US'),
    };
  }
}
