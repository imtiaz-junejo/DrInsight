import { Injectable } from '@nestjs/common';
import {
  AppointmentStatus,
  BlogStatus,
  DoctorAvailability,
  PaymentStatus,
  QuestionStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlatformService {
  constructor(private prisma: PrismaService) {}

  async getPublicStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      doctorCount,
      verifiedDoctorCount,
      activeDoctorCount,
      blogCount,
      patientCount,
      userCount,
      adminCount,
      answeredQuestions,
      pendingQuestions,
      avgRating,
      appointmentCount,
      completedAppointments,
      pendingAppointments,
      cancelledAppointments,
      appointmentsLast30Days,
      reviewCount,
      specialtyGroups,
      prescriptionCount,
      paymentAgg,
      paymentLast30Days,
      notificationCount,
      messageCount,
      newsletterCount,
      contactCount,
      patientsServedAgg,
      countryGroups,
      hospitalGroups,
    ] = await Promise.all([
      this.prisma.doctorProfile.count({
        where: { user: { status: UserStatus.ACTIVE } },
      }),
      this.prisma.doctorProfile.count({
        where: {
          user: { status: UserStatus.ACTIVE },
          credentialsVerifiedAt: { not: null },
        },
      }),
      this.prisma.doctorProfile.count({
        where: {
          user: { status: UserStatus.ACTIVE },
          availability: DoctorAvailability.AVAILABLE,
        },
      }),
      this.prisma.blogPost.count({ where: { status: BlogStatus.PUBLISHED } }),
      this.prisma.user.count({ where: { role: UserRole.PATIENT } }),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: UserRole.ADMIN } }),
      this.prisma.askDoctorQuestion.count({ where: { status: QuestionStatus.ANSWERED } }),
      this.prisma.askDoctorQuestion.count({ where: { status: QuestionStatus.PENDING } }),
      this.prisma.doctorProfile.aggregate({
        where: { user: { status: UserStatus.ACTIVE } },
        _avg: { rating: true },
      }),
      this.prisma.appointment.count(),
      this.prisma.appointment.count({ where: { status: AppointmentStatus.COMPLETED } }),
      this.prisma.appointment.count({
        where: {
          status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
        },
      }),
      this.prisma.appointment.count({ where: { status: AppointmentStatus.CANCELLED } }),
      this.prisma.appointment.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      this.prisma.review.count(),
      this.prisma.doctorProfile.groupBy({
        by: ['specialty'],
        where: { user: { status: UserStatus.ACTIVE } },
      }),
      this.prisma.prescription.count(),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.SUCCEEDED },
        _sum: { amountCents: true },
        _count: { _all: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.SUCCEEDED,
          confirmedAt: { gte: thirtyDaysAgo },
        },
        _sum: { amountCents: true },
        _count: { _all: true },
      }),
      this.prisma.notification.count(),
      this.prisma.message.count(),
      this.prisma.newsletterSubscriber.count({ where: { isActive: true } }),
      this.prisma.contactSubmission.count(),
      this.prisma.doctorProfile.aggregate({
        where: { user: { status: UserStatus.ACTIVE } },
        _sum: { patientsTreated: true },
      }),
      this.prisma.doctorProfile.groupBy({
        by: ['country'],
        where: { user: { status: UserStatus.ACTIVE }, country: { not: null } },
      }),
      this.prisma.doctorProfile.groupBy({
        by: ['hospital'],
        where: { user: { status: UserStatus.ACTIVE }, hospital: { not: null } },
      }),
    ]);

    return {
      doctorCount,
      verifiedDoctorCount,
      activeDoctorCount,
      blogCount,
      patientCount,
      userCount,
      adminCount,
      answeredQuestions,
      pendingQuestions,
      averageRating: Math.round((avgRating._avg.rating || 0) * 10) / 10,
      appointmentCount,
      completedAppointments,
      pendingAppointments,
      cancelledAppointments,
      appointmentsLast30Days,
      reviewCount,
      specialtyCount: specialtyGroups.length,
      prescriptionCount,
      paymentCount: paymentAgg._count._all,
      revenueCents: paymentAgg._sum.amountCents ?? 0,
      revenueLast30DaysCents: paymentLast30Days._sum.amountCents ?? 0,
      paymentsLast30Days: paymentLast30Days._count._all,
      notificationCount,
      messageCount,
      newsletterCount,
      contactCount,
      patientsServed: patientsServedAgg._sum.patientsTreated ?? patientCount,
      countryCount: countryGroups.length,
      hospitalCount: hospitalGroups.length,
    };
  }

  async getSiteSettings() {
    const settings = await this.prisma.siteSettings.findUnique({ where: { id: 'default' } });
    if (!settings) {
      return {
        contactPhone: '',
        contactEmail: '',
        contactWhatsapp: null,
        addressLine1: null,
        addressLine2: null,
        city: null,
        country: 'Pakistan',
        businessHours: [],
      };
    }
    return settings;
  }

  async getFeaturedHospitals(limit = 12) {
    const doctors = await this.prisma.doctorProfile.findMany({
      where: {
        user: { status: UserStatus.ACTIVE },
        hospital: { not: null },
      },
      select: { hospital: true, city: true, specialty: true },
      orderBy: { rating: 'desc' },
      take: 100,
    });

    const seen = new Set<string>();
    const hospitals: Array<{ name: string; city: string | null; specialty: string }> = [];

    for (const doctor of doctors) {
      const key = doctor.hospital!;
      if (seen.has(key)) continue;
      seen.add(key);
      hospitals.push({
        name: doctor.hospital!,
        city: doctor.city,
        specialty: doctor.specialty,
      });
      if (hospitals.length >= limit) break;
    }

    return hospitals;
  }
}
