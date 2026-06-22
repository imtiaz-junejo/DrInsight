import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(patientUserId: string, data: { doctorId: string; appointmentId?: string; rating: number; comment?: string }) {
    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const patient = await this.prisma.patientProfile.findUnique({ where: { userId: patientUserId } });
    if (!patient) throw new BadRequestException('Patient profile required');

    const review = await this.prisma.review.create({
      data: {
        doctorId: data.doctorId,
        patientId: patient.id,
        appointmentId: data.appointmentId,
        rating: data.rating,
        comment: data.comment,
      },
    });

    const stats = await this.prisma.review.aggregate({
      where: { doctorId: data.doctorId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await this.prisma.doctorProfile.update({
      where: { id: data.doctorId },
      data: {
        rating: stats._avg.rating || 0,
        reviewCount: stats._count.rating,
      },
    });

    return review;
  }

  async findRecent(limit = 6) {
    return this.prisma.review.findMany({
      where: { comment: { not: null } },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        doctor: {
          include: {
            user: { select: { firstName: true, lastName: true, specialty: true } },
          },
        },
      },
    });
  }

  async findByDoctor(doctorId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { doctorId },
        skip,
        take: limit,
        include: {
          patient: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where: { doctorId } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
