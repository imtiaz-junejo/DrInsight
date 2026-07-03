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
} from '@prisma/client';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

export interface CreateBookingDraftInput {
  doctorId: string;
  scheduledAt: string;
  durationMinutes?: number;
  consultationType: ConsultationType;
  reason?: string;
}

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe | null;

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private config: ConfigService,
  ) {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    this.stripe = secretKey ? new Stripe(secretKey) : null;
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

    const existing = await this.prisma.appointment.findFirst({
      where: {
        doctorId: doctor.id,
        scheduledAt,
        status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
      },
    });
    if (existing) throw new BadRequestException('Selected appointment slot is no longer available');

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 20);

    return this.prisma.bookingDraft.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        scheduledAt,
        durationMinutes: input.durationMinutes || 30,
        consultationType: input.consultationType,
        reason: input.reason,
        amountCents: Math.round(Number(doctor.consultationFee) * 100),
        currency: 'usd',
        expiresAt,
      },
      include: {
        doctor: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
      },
    });
  }

  async createPaymentIntent(patientUserId: string, bookingDraftId: string) {
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

    if (draft.payment) return draft.payment;

    const intent = await this.createProviderIntent(draft.id, draft.amountCents, draft.currency);

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          bookingDraftId: draft.id,
          providerIntentId: intent.providerIntentId,
          clientSecret: intent.clientSecret,
          amountCents: draft.amountCents,
          currency: draft.currency,
          status: PaymentStatus.REQUIRES_PAYMENT_METHOD,
          metadata: {
            doctorId: draft.doctorId,
            patientId: draft.patientId,
          },
        },
      });

      await tx.bookingDraft.update({
        where: { id: draft.id },
        data: { status: BookingDraftStatus.PAYMENT_PENDING },
      });

      return payment;
    });
  }

  async handleStripeWebhook(payload: {
    providerIntentId: string;
    status: 'succeeded' | 'failed' | 'cancelled';
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

    if (payload.status !== 'succeeded') {
      return this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: payload.status === 'cancelled' ? PaymentStatus.CANCELLED : PaymentStatus.FAILED,
        },
      });
    }

    if (payment.appointmentId) return payment;

    const draft = payment.bookingDraft;
    const slotTaken = await this.prisma.appointment.findFirst({
      where: {
        doctorId: draft.doctorId,
        scheduledAt: draft.scheduledAt,
        status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
      },
    });
    if (slotTaken) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });
      throw new BadRequestException('Selected appointment slot is no longer available');
    }

    const confirmed = await this.prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.create({
        data: {
          patientId: payment.bookingDraft.patientId,
          doctorId: payment.bookingDraft.doctorId,
          scheduledAt: payment.bookingDraft.scheduledAt,
          durationMinutes: payment.bookingDraft.durationMinutes,
          consultationType: payment.bookingDraft.consultationType,
          reason: payment.bookingDraft.reason,
          status: AppointmentStatus.CONFIRMED,
          meetingRoomId: `room_${payment.bookingDraft.id}`,
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
        },
        include: { appointment: true },
      });
    });

    await this.notifications.create(payment.bookingDraft.doctor.userId, {
      type: 'APPOINTMENT',
      title: 'Paid appointment confirmed',
      body: `A ${payment.bookingDraft.consultationType} consultation has been confirmed.`,
      data: { appointmentId: confirmed.appointmentId },
    });

    await this.notifications.create(payment.bookingDraft.patient.userId, {
      type: 'APPOINTMENT',
      title: 'Appointment confirmed',
      body: 'Your payment was successful and your consultation is confirmed.',
      data: { appointmentId: confirmed.appointmentId },
    });

    return confirmed;
  }

  async handleStripeWebhookEvent(event: Stripe.Event) {
    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent;
      return this.handleStripeWebhook({
        providerIntentId: intent.id,
        status: 'succeeded',
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

  async findPaymentHistory(patientUserId: string) {
    const patient = await this.prisma.patientProfile.findUnique({ where: { userId: patientUserId } });
    if (!patient) return [];

    return this.prisma.payment.findMany({
      where: {
        bookingDraft: { patientId: patient.id },
        status: 'SUCCEEDED',
      },
      include: {
        appointment: {
          include: {
            doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
          },
        },
        bookingDraft: true,
      },
      orderBy: { confirmedAt: 'desc' },
    });
  }

  async findDoctorEarnings(doctorUserId: string) {
    const doctor = await this.prisma.doctorProfile.findUnique({ where: { userId: doctorUserId } });
    if (!doctor) return { totalCents: 0, monthly: [] };

    const payments = await this.prisma.payment.findMany({
      where: {
        status: 'SUCCEEDED',
        bookingDraft: { doctorId: doctor.id },
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

  async findAllPayments() {
    return this.prisma.payment.findMany({
      where: { status: 'SUCCEEDED' },
      include: {
        bookingDraft: {
          include: {
            doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
            patient: { include: { user: { select: { firstName: true, lastName: true } } } },
          },
        },
        appointment: true,
      },
      orderBy: { confirmedAt: 'desc' },
      take: 100,
    });
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

  private async createProviderIntent(bookingDraftId: string, amountCents: number, currency: string) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe payments are not configured');
    }

    const intent = await this.stripe.paymentIntents.create({
      amount: amountCents,
      currency,
      metadata: { bookingDraftId },
      automatic_payment_methods: { enabled: true },
    });

    if (!intent.client_secret) {
      throw new BadRequestException('Unable to create payment intent');
    }

    return {
      providerIntentId: intent.id,
      clientSecret: intent.client_secret,
    };
  }
}
