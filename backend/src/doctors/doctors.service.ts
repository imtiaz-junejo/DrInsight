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
      include: { user: true },
    });
    if (!doctor) throw new NotFoundException('Doctor profile not found');
    return doctor;
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
