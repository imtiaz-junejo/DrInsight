import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { AppointmentStatus, ConsultationType, UserRole, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
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

  async findForUser(userId: string, role: UserRole, query: { page?: number; limit?: number; status?: AppointmentStatus }) {
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

    const [data, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        include: {
          doctor: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
          patient: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
          payment: { select: { status: true, amountCents: true, currency: true } },
        },
        orderBy: { scheduledAt: 'desc' },
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async updateStatus(appointmentId: string, userId: string, role: UserRole, status: AppointmentStatus) {
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
      data: { status, ...(status === 'CANCELLED' && { cancelledAt: new Date() }) },
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
      body: `Your appointment status is now ${status}`,
      data: { appointmentId },
    });

    return updated;
  }
}
