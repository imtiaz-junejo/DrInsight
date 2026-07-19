import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import {
  AppointmentStatus,
  BookingSource,
  ConsultationType,
  UserRole,
  UserStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileNumberService } from '../prisma/profile-number.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateManualAppointmentDto } from './dto/doctor-appointment.dto';

const ONLINE_TYPES: ConsultationType[] = [
  ConsultationType.VIDEO,
  ConsultationType.AUDIO,
  ConsultationType.CHAT,
];

function todayRange(): { gte: Date; lt: Date } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { gte: start, lt: end };
}

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private profileNumbers: ProfileNumberService,
    private notifications: NotificationsService,
  ) {}

  async create(patientUserId: string, data: {
    doctorId: string;
    scheduledAt: string;
    durationMinutes?: number;
    consultationType: ConsultationType;
    reason?: string;
  }) {
    throw new BadRequestException(
      'Appointments are created only after confirmed payment. Use /payments/booking-drafts and /payments/intents.',
    );
  }

  async findForUser(
    userId: string,
    role: UserRole,
    query: {
      page?: number;
      limit?: number;
      status?: AppointmentStatus;
      kind?: 'PHYSICAL' | 'ONLINE';
      range?: 'today' | 'upcoming' | 'past';
      manualOnly?: boolean;
      search?: string;
    },
  ) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    let where: Prisma.AppointmentWhereInput = {};

    if (role === UserRole.PATIENT) {
      const patient = await this.prisma.patientProfile.findUnique({ where: { userId } });
      if (!patient) return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
      where = { patientId: patient.id };
    } else if (role === UserRole.DOCTOR) {
      const doctor = await this.prisma.doctorProfile.findUnique({ where: { userId } });
      if (!doctor) return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
      where = { doctorId: doctor.id };
    } else {
      where = {};
    }

    if (query.status) where.status = query.status;
    if (query.kind === 'PHYSICAL') where.consultationType = ConsultationType.IN_PERSON;
    if (query.kind === 'ONLINE') where.consultationType = { in: ONLINE_TYPES };
    if (query.manualOnly) where.bookingSource = { not: BookingSource.ONLINE };
    if (query.range === 'today') where.scheduledAt = todayRange();
    if (query.range === 'upcoming') where.scheduledAt = { gte: new Date() };
    if (query.range === 'past') where.scheduledAt = { lt: new Date() };
    if (query.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { reason: { contains: term, mode: 'insensitive' } },
        { patient: { user: { firstName: { contains: term, mode: 'insensitive' } } } },
        { patient: { user: { lastName: { contains: term, mode: 'insensitive' } } } },
        { patient: { patientNumber: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        include: {
          doctor: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } },
          patient: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, phone: true } } } },
          payment: { select: { status: true, amountCents: true, currency: true } },
          prescription: { select: { id: true } },
        },
        orderBy: { scheduledAt: query.range === 'upcoming' || query.range === 'today' ? 'asc' : 'desc' },
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(appointmentId: string, role: UserRole) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                avatarUrl: true,
                status: true,
              },
            },
          },
        },
        patient: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                avatarUrl: true,
                status: true,
              },
            },
          },
        },
        payment: true,
        prescription: true,
        review: {
          include: {
            patient: {
              include: {
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
      },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    if (role === UserRole.DOCTOR) {
      const doctor = await this.prisma.doctorProfile.findUnique({ where: { userId: appointment.doctor.userId } });
      if (!doctor || doctor.id !== appointment.doctorId) throw new ForbiddenException();
    } else if (role === UserRole.PATIENT) {
      const patient = await this.prisma.patientProfile.findUnique({ where: { userId: appointment.patient.userId } });
      if (!patient || patient.id !== appointment.patientId) throw new ForbiddenException();
    }

    const userTag = `#APT-${appointment.id.slice(-4)}`;
    const auditLogs = await this.prisma.auditLogEntry.findMany({
      where: {
        OR: [
          { target: { contains: appointment.id, mode: 'insensitive' } },
          { target: { contains: userTag, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    return { ...appointment, auditLogs };
  }

  async updateStatus(
    appointmentId: string,
    userId: string,
    role: UserRole,
    status: AppointmentStatus,
    cancelReason?: string,
  ) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { doctor: true, patient: { include: { user: true } } },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    if (role === UserRole.DOCTOR) {
      const doctor = await this.prisma.doctorProfile.findUnique({ where: { userId } });
      if (doctor?.id !== appointment.doctorId) throw new ForbiddenException();
    } else if (role === UserRole.PATIENT) {
      const patient = await this.prisma.patientProfile.findUnique({ where: { userId } });
      if (patient?.id !== appointment.patientId) throw new ForbiddenException();
    }

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status,
        ...(status === 'CANCELLED' && { cancelledAt: new Date(), cancelReason: cancelReason ?? null }),
      },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    });

    const notifyUserId = role === UserRole.DOCTOR
      ? appointment.patient.user.id
      : appointment.doctor.userId;

    await this.notifications.create(notifyUserId, {
      type: 'APPOINTMENT',
      title: 'Appointment Updated',
      body: `Your appointment status is now ${status}${cancelReason ? ` — ${cancelReason}` : ''}`,
      data: { appointmentId },
    });

    return updated;
  }

  async reschedule(appointmentId: string, userId: string, role: UserRole, scheduledAt: string, reason?: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { doctor: true, patient: { include: { user: true } } },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    if (role === UserRole.DOCTOR) {
      const doctor = await this.prisma.doctorProfile.findUnique({ where: { userId } });
      if (doctor?.id !== appointment.doctorId) throw new ForbiddenException();
    } else if (role === UserRole.PATIENT) {
      const patient = await this.prisma.patientProfile.findUnique({ where: { userId } });
      if (patient?.id !== appointment.patientId) throw new ForbiddenException();
    }

    if (
      appointment.status !== AppointmentStatus.PENDING &&
      appointment.status !== AppointmentStatus.CONFIRMED
    ) {
      throw new BadRequestException('Only pending or confirmed appointments can be rescheduled');
    }

    const newDate = new Date(scheduledAt);
    if (Number.isNaN(newDate.getTime()) || newDate.getTime() < Date.now()) {
      throw new BadRequestException('The new appointment time must be in the future');
    }

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { scheduledAt: newDate },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    });

    const notifyUserId = role === UserRole.DOCTOR
      ? appointment.patient.user.id
      : appointment.doctor.userId;

    await this.notifications.create(notifyUserId, {
      type: 'APPOINTMENT',
      title: 'Appointment Rescheduled',
      body: `Your appointment has been moved to ${newDate.toLocaleString()}${reason ? ` — ${reason}` : ''}`,
      data: { appointmentId },
    });

    return updated;
  }

  async createManual(doctorUserId: string, dto: CreateManualAppointmentDto) {
    const doctor = await this.prisma.doctorProfile.findUnique({ where: { userId: doctorUserId } });
    if (!doctor) throw new NotFoundException('Doctor profile not found');

    if (dto.bookingSource === BookingSource.ONLINE) {
      throw new BadRequestException('Manual appointments must be walk-in or phone bookings');
    }
    if (!dto.patientId && !dto.newPatient) {
      throw new BadRequestException('Select an existing patient or provide new patient details');
    }

    const scheduledAt = new Date(dto.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) {
      throw new BadRequestException('Invalid appointment time');
    }

    let patientId = dto.patientId ?? null;

    if (!patientId && dto.newPatient) {
      const created = await this.prisma.$transaction(async (tx) => {
        const nameParts = dto.newPatient!.name.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || firstName;
        const user = await tx.user.create({
          data: {
            email: `walkin.${Date.now()}.${randomBytes(4).toString('hex')}@manual.drinsight.local`,
            firstName,
            lastName,
            phone: dto.newPatient!.phone,
            role: UserRole.PATIENT,
            status: UserStatus.ACTIVE,
          },
        });
        const profile = await tx.patientProfile.create({
          data: {
            userId: user.id,
            gender: dto.newPatient!.gender ?? null,
            address: dto.newPatient!.address ?? null,
            ...(dto.newPatient!.age
              ? { dateOfBirth: new Date(Date.now() - dto.newPatient!.age * 365.25 * 24 * 3600 * 1000) }
              : {}),
          },
        });
        await this.profileNumbers.ensurePatientNumber(profile.id, tx);
        return profile;
      });
      patientId = created.id;
    }

    const patient = await this.prisma.patientProfile.findUnique({
      where: { id: patientId! },
      include: { user: true },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const durationMinutes = dto.durationMinutes ?? 30;
    const overlapping = await this.prisma.appointment.findFirst({
      where: {
        doctorId: doctor.id,
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS] },
        scheduledAt: {
          gte: new Date(scheduledAt.getTime() - durationMinutes * 60000),
          lt: new Date(scheduledAt.getTime() + durationMinutes * 60000),
        },
      },
    });
    if (overlapping) {
      throw new BadRequestException('This time slot conflicts with another appointment');
    }

    return this.prisma.appointment.create({
      data: {
        doctorId: doctor.id,
        patientId: patient.id,
        scheduledAt,
        durationMinutes,
        consultationType: ConsultationType.IN_PERSON,
        bookingSource: dto.bookingSource,
        bookedByUserId: doctorUserId,
        status: AppointmentStatus.CONFIRMED,
        reason: dto.reason ?? null,
        notes: dto.notes ?? null,
      },
      include: {
        patient: { include: { user: { select: { id: true, firstName: true, lastName: true, phone: true, avatarUrl: true } } } },
      },
    });
  }

  async getDoctorCounts(doctorUserId: string) {
    const doctor = await this.prisma.doctorProfile.findUnique({ where: { userId: doctorUserId } });
    if (!doctor) throw new NotFoundException('Doctor profile not found');

    const range = todayRange();
    const activeStatuses: AppointmentStatus[] = [AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS];
    const base = { doctorId: doctor.id };

    const [
      physRequests,
      physToday,
      physManual,
      ocRequests,
      ocUpcoming,
      ocToday,
      ocOngoing,
      consultationsToday,
      pendingQuestions,
    ] = await Promise.all([
      this.prisma.appointment.count({
        where: { ...base, consultationType: ConsultationType.IN_PERSON, status: AppointmentStatus.PENDING },
      }),
      this.prisma.appointment.count({
        where: { ...base, consultationType: ConsultationType.IN_PERSON, status: { in: activeStatuses }, scheduledAt: range },
      }),
      this.prisma.appointment.count({
        where: { ...base, bookingSource: { not: BookingSource.ONLINE }, scheduledAt: range },
      }),
      this.prisma.appointment.count({
        where: { ...base, consultationType: { in: ONLINE_TYPES }, status: AppointmentStatus.PENDING },
      }),
      this.prisma.appointment.count({
        where: { ...base, consultationType: { in: ONLINE_TYPES }, status: AppointmentStatus.CONFIRMED, scheduledAt: { gte: new Date() } },
      }),
      this.prisma.appointment.count({
        where: { ...base, consultationType: { in: ONLINE_TYPES }, status: { in: activeStatuses }, scheduledAt: range },
      }),
      this.prisma.appointment.count({
        where: { ...base, consultationType: { in: ONLINE_TYPES }, status: AppointmentStatus.IN_PROGRESS },
      }),
      this.prisma.appointment.count({
        where: { ...base, scheduledAt: range, status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] } },
      }),
      this.prisma.askDoctorQuestion.count({ where: { status: 'APPROVED', answerDraft: null } }),
    ]);

    const qaDrafts = await this.prisma.askDoctorQuestion.count({
      where: { status: 'APPROVED', answerDraft: { not: null } },
    });

    return {
      physRequests,
      physToday,
      physManual,
      ocRequests,
      ocUpcoming,
      ocToday,
      ocOngoing,
      consultationsToday,
      qaNew: pendingQuestions,
      qaDrafts,
    };
  }

  async getPatientCounts(patientUserId: string) {
    const patient = await this.prisma.patientProfile.findUnique({ where: { userId: patientUserId } });
    if (!patient) throw new NotFoundException('Patient profile not found');

    const base = { patientId: patient.id };
    const now = new Date();

    const [
      ocPending,
      ocUpcoming,
      ocOngoing,
      physPending,
      physConfirmed,
      qaPending,
      qaAnswered,
      qaRejected,
      savedArticles,
    ] = await Promise.all([
      this.prisma.appointment.count({
        where: { ...base, consultationType: { in: ONLINE_TYPES }, status: AppointmentStatus.PENDING },
      }),
      this.prisma.appointment.count({
        where: {
          ...base,
          consultationType: { in: ONLINE_TYPES },
          status: AppointmentStatus.CONFIRMED,
          scheduledAt: { gte: now },
        },
      }),
      this.prisma.appointment.count({
        where: { ...base, consultationType: { in: ONLINE_TYPES }, status: AppointmentStatus.IN_PROGRESS },
      }),
      this.prisma.appointment.count({
        where: { ...base, consultationType: ConsultationType.IN_PERSON, status: AppointmentStatus.PENDING },
      }),
      this.prisma.appointment.count({
        where: {
          ...base,
          consultationType: ConsultationType.IN_PERSON,
          status: AppointmentStatus.CONFIRMED,
          scheduledAt: { gte: now },
        },
      }),
      this.prisma.askDoctorQuestion.count({
        where: { submitterUserId: patientUserId, status: 'PENDING' },
      }),
      this.prisma.askDoctorQuestion.count({
        where: { submitterUserId: patientUserId, status: 'ANSWERED' },
      }),
      this.prisma.askDoctorQuestion.count({
        where: { submitterUserId: patientUserId, status: 'REJECTED' },
      }),
      this.prisma.blogPostBookmark.count({ where: { userId: patientUserId } }),
    ]);

    return {
      ocPending,
      ocUpcoming,
      ocOngoing,
      physPending,
      physUpcoming: physConfirmed,
      physConfirmed,
      qaPending,
      qaAnswered,
      qaRejected,
      savedArticles,
    };
  }
}
