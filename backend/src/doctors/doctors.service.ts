import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogStatus, DoctorAvailability, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const publicUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  email: true,
  phone: true,
  isOnline: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

const relatedDoctorSelect = {
  id: true,
  specialty: true,
  subSpecialty: true,
  rating: true,
  reviewCount: true,
  hospital: true,
  city: true,
  country: true,
  experienceYears: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      isOnline: true,
    },
  },
} satisfies Prisma.DoctorProfileSelect;

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

    const [data, total, articleGroups] = await Promise.all([
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
      this.prisma.blogPost.groupBy({
        by: ['authorId'],
        where: { status: BlogStatus.PUBLISHED },
        _count: { _all: true },
      }),
    ]);

    const articleCountByAuthor = new Map(
      articleGroups.map((g) => [g.authorId, g._count._all]),
    );

    return {
      data: data.map((doctor) => ({
        ...doctor,
        articleCount: articleCountByAuthor.get(doctor.userId) ?? 0,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const doctor = await this.prisma.doctorProfile.findUnique({
      where: { id },
      include: {
        user: { select: publicUserSelect },
        reviews: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            patient: {
              include: {
                user: { select: { firstName: true, lastName: true, avatarUrl: true } },
              },
            },
            appointment: {
              select: { consultationType: true, reason: true },
            },
          },
        },
      },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const [ratingGroups, articles, consultationCount, relatedDoctors, similarSpecialists, articleAgg] =
      await Promise.all([
        this.prisma.review.groupBy({
          by: ['rating'],
          where: { doctorId: id },
          _count: { rating: true },
        }),
        this.prisma.blogPost.findMany({
          where: { authorId: doctor.userId, status: BlogStatus.PUBLISHED },
          orderBy: { publishedAt: 'desc' },
          take: 24,
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            coverImageUrl: true,
            readTimeMinutes: true,
            viewCount: true,
            publishedAt: true,
            tags: true,
            category: { select: { id: true, name: true, slug: true } },
          },
        }),
        this.prisma.appointment.count({
          where: { doctorId: id, status: { in: ['COMPLETED', 'CONFIRMED', 'IN_PROGRESS'] } },
        }),
        this.prisma.doctorProfile.findMany({
          where: {
            id: { not: id },
            user: { status: 'ACTIVE' },
          },
          take: 4,
          orderBy: { rating: 'desc' },
          select: relatedDoctorSelect,
        }),
        this.prisma.doctorProfile.findMany({
          where: {
            id: { not: id },
            specialty: doctor.specialty,
            user: { status: 'ACTIVE' },
          },
          take: 4,
          orderBy: { rating: 'desc' },
          select: relatedDoctorSelect,
        }),
        this.prisma.blogPost.aggregate({
          where: { authorId: doctor.userId, status: BlogStatus.PUBLISHED },
          _count: { _all: true },
          _sum: { viewCount: true, readTimeMinutes: true },
        }),
      ]);

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const group of ratingGroups) {
      const key = group.rating as 1 | 2 | 3 | 4 | 5;
      if (key >= 1 && key <= 5) ratingDistribution[key] = group._count.rating;
    }

    const articleCount = articleAgg._count._all;
    const totalViews = articleAgg._sum.viewCount ?? 0;
    const totalReadMinutes = articleAgg._sum.readTimeMinutes ?? 0;
    const avgReadTimeMinutes = articleCount > 0 ? Math.round(totalReadMinutes / articleCount) : 0;

    const fee = Number(doctor.consultationFee);
    const consultationFees = {
      video: fee,
      phone: Math.round(fee * 0.75),
      chat: Math.round(fee * 0.5),
    };

    return {
      ...doctor,
      consultationFees,
      patientsTreated: doctor.patientsTreated || consultationCount,
      consultationCount,
      ratingDistribution,
      articles,
      articleStats: {
        count: articleCount,
        totalViews,
        avgReadTimeMinutes,
      },
      relatedDoctors,
      similarSpecialists,
    };
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

  async updateProfile(
    userId: string,
    data: Partial<{
      specialty: string;
      subSpecialty: string;
      bio: string;
      bioFull: string;
      credentials: string;
      professionalTitle: string;
      consultationFee: number;
      availability: DoctorAvailability;
      languages: string[];
      expertise: string[];
      services: string[];
      researchTags: string[];
      education: string;
      hospital: string;
      city: string;
      country: string;
      gender: string;
      address: string;
      responseTime: string;
      linkedinUrl: string;
      twitterUrl: string;
      platformRole: string;
      editorialBoard: boolean;
      medicalReviewerFor: string;
      conflictOfInterest: string;
      educationHistory: Prisma.InputJsonValue;
      certifications: Prisma.InputJsonValue;
      publications: Prisma.InputJsonValue;
      awards: Prisma.InputJsonValue;
      speakingEngagements: Prisma.InputJsonValue;
      weeklySchedule: Prisma.InputJsonValue;
    }>,
  ) {
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
