import { Injectable } from '@nestjs/common';
import { BlogStatus, QuestionStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlatformService {
  constructor(private prisma: PrismaService) {}

  async getPublicStats() {
    const [
      doctorCount,
      blogCount,
      patientCount,
      answeredQuestions,
      avgRating,
      appointmentCount,
      reviewCount,
      specialtyGroups,
    ] = await Promise.all([
      this.prisma.doctorProfile.count({
        where: { user: { status: 'ACTIVE' } },
      }),
      this.prisma.blogPost.count({ where: { status: BlogStatus.PUBLISHED } }),
      this.prisma.user.count({ where: { role: UserRole.PATIENT, status: 'ACTIVE' } }),
      this.prisma.askDoctorQuestion.count({ where: { status: QuestionStatus.ANSWERED } }),
      this.prisma.doctorProfile.aggregate({ _avg: { rating: true } }),
      this.prisma.appointment.count(),
      this.prisma.review.count(),
      this.prisma.doctorProfile.groupBy({ by: ['specialty'] }),
    ]);

    return {
      doctorCount,
      blogCount,
      patientCount,
      answeredQuestions,
      averageRating: Math.round((avgRating._avg.rating || 0) * 10) / 10,
      appointmentCount,
      reviewCount,
      specialtyCount: specialtyGroups.length,
    };
  }
}
