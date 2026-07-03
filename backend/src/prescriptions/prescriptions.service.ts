import { Injectable, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) {}

  async create(doctorUserId: string, data: {
    appointmentId: string;
    diagnosis?: string;
    items: Array<{ medication: string; dosage: string; frequency: string; duration: string; instructions?: string }>;
    notes?: string;
  }) {
    const doctor = await this.prisma.doctorProfile.findUnique({ where: { userId: doctorUserId } });
    if (!doctor) throw new ForbiddenException();

    const appointment = await this.prisma.appointment.findUnique({ where: { id: data.appointmentId } });
    if (!appointment || appointment.doctorId !== doctor.id) throw new ForbiddenException();

    return this.prisma.prescription.create({
      data: {
        appointmentId: data.appointmentId,
        doctorId: doctor.id,
        patientId: appointment.patientId,
        diagnosis: data.diagnosis,
        items: data.items,
        notes: data.notes,
      },
    });
  }

  async findForUser(userId: string, role: UserRole) {
    if (role === UserRole.ADMIN) {
      return this.prisma.prescription.findMany({
        include: {
          appointment: true,
          doctor: { include: { user: true } },
          patient: { include: { user: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    }

    if (role === UserRole.DOCTOR) {
      const doctor = await this.prisma.doctorProfile.findUnique({ where: { userId } });
      if (!doctor) return [];
      return this.prisma.prescription.findMany({
        where: { doctorId: doctor.id },
        include: { appointment: true, patient: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
      });
    }

    const patient = await this.prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) return [];
    return this.prisma.prescription.findMany({
      where: { patientId: patient.id },
      include: { appointment: true, doctor: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
