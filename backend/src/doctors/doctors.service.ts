import { Injectable, NotFoundException } from '@nestjs/common';
import { DoctorAvailability, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    specialty?: string;
    search?: string;
    availability?: DoctorAvailability;
    minRating?: number;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;

    const where: Prisma.DoctorProfileWhereInput = {
      user: { status: 'ACTIVE' },
      ...(query.specialty && { specialty: { contains: query.specialty, mode: 'insensitive' } }),
      ...(query.availability && { availability: query.availability }),
      ...(query.minRating && { rating: { gte: query.minRating } }),
      ...(query.search && {
        OR: [
          { specialty: { contains: query.search, mode: 'insensitive' } },
          { user: { firstName: { contains: query.search, mode: 'insensitive' } } },
          { user: { lastName: { contains: query.search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.doctorProfile.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              isOnline: true,
            },
          },
        },
        orderBy: { rating: 'desc' },
      }),
      this.prisma.doctorProfile.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const doctor = await this.prisma.doctorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            email: true,
            phone: true,
            isOnline: true,
          },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            patient: {
              include: {
                user: { select: { firstName: true, lastName: true, avatarUrl: true } },
              },
            },
          },
        },
      },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');
    return doctor;
  }

  async findByUserId(userId: string) {
    const doctor = await this.prisma.doctorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            email: true,
            phone: true,
            isOnline: true,
          },
        },
      },
    });
    if (!doctor) throw new NotFoundException('Doctor profile not found');
    return doctor;
  }

  async getPatients(doctorUserId: string) {
    const doctor = await this.prisma.doctorProfile.findUnique({ where: { userId: doctorUserId } });
    if (!doctor) return [];

    const appointments = await this.prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      include: {
        patient: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });

    const seen = new Set<string>();
    const patients: Array<{
      patientId: string;
      user: { id: string; firstName: string; lastName: string; avatarUrl: string | null };
      lastVisit: Date;
      nextAppt: Date | null;
      appointmentCount: number;
    }> = [];

    for (const appt of appointments) {
      if (seen.has(appt.patientId)) continue;
      seen.add(appt.patientId);

      const patientAppts = appointments.filter((a) => a.patientId === appt.patientId);
      const upcoming = patientAppts
        .filter((a) => a.scheduledAt > new Date() && !['CANCELLED', 'COMPLETED'].includes(a.status))
        .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());

      patients.push({
        patientId: appt.patientId,
        user: appt.patient.user,
        lastVisit: patientAppts[0].scheduledAt,
        nextAppt: upcoming[0]?.scheduledAt ?? null,
        appointmentCount: patientAppts.length,
      });
    }

    return patients;
  }

  async updateProfile(userId: string, data: Partial<{
    specialty: string;
    subSpecialty: string;
    bio: string;
    consultationFee: number;
    availability: DoctorAvailability;
    languages: string[];
    education: string;
    hospital: string;
  }>) {
    return this.prisma.doctorProfile.update({
      where: { userId },
      data,
      include: { user: true },
    });
  }

  async getSpecialties() {
    const specialties = await this.prisma.doctorProfile.groupBy({
      by: ['specialty'],
      _count: { specialty: true },
      orderBy: { _count: { specialty: 'desc' } },
    });
    return specialties.map((s) => ({ name: s.specialty, count: s._count.specialty }));
  }
}
