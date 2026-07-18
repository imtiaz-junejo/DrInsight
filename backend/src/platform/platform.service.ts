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
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      doctorCount,
      verifiedDoctorCount,
      activeDoctorCount,
      blogCount,
      patientCount,
      userCount,
      adminCount,
      usersThisWeek,
      pendingDoctors,
      answeredQuestions,
      pendingQuestions,
      avgRating,
      appointmentCount,
      completedAppointments,
      pendingAppointments,
      cancelledAppointments,
      appointmentsLast30Days,
      appointmentsPrevious30Days,
      reviewCount,
      specialtyGroups,
      prescriptionCount,
      paymentAgg,
      paymentLast30Days,
      paymentPrevious30Days,
      notificationCount,
      messageCount,
      newsletterCount,
      contactCount,
      patientsServedAgg,
      countryGroups,
      hospitalGroups,
      patientsThisWeek,
      patientsWithActiveBookings,
      askDoctorQuestionCount,
      publicationBookmarkCount,
      reviewsRecentAvg,
      reviewsPreviousAvg,
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
      this.prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      this.prisma.user.count({
        where: { role: UserRole.DOCTOR, status: UserStatus.PENDING },
      }),
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
      this.prisma.appointment.count({
        where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
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
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.SUCCEEDED,
          confirmedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
        _sum: { amountCents: true },
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
      this.prisma.user.count({
        where: { role: UserRole.PATIENT, createdAt: { gte: sevenDaysAgo } },
      }),
      this.prisma.appointment.findMany({
        where: {
          status: {
            in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS],
          },
          scheduledAt: { gte: now },
        },
        select: { patientId: true },
        distinct: ['patientId'],
      }),
      this.prisma.askDoctorQuestion.count(),
      this.prisma.publicationBookmark.count(),
      this.prisma.review.aggregate({
        where: { createdAt: { gte: thirtyDaysAgo } },
        _avg: { rating: true },
      }),
      this.prisma.review.aggregate({
        where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
        _avg: { rating: true },
      }),
    ]);

    const appointmentsGrowthPercent =
      appointmentsPrevious30Days > 0
        ? Math.round(
            ((appointmentsLast30Days - appointmentsPrevious30Days) / appointmentsPrevious30Days) *
              1000,
          ) / 10
        : appointmentsLast30Days > 0
          ? 100
          : 0;

    const revenueLast30 = paymentLast30Days._sum.amountCents ?? 0;
    const revenuePrevious30 = paymentPrevious30Days._sum.amountCents ?? 0;
    const revenueGrowthPercent =
      revenuePrevious30 > 0
        ? Math.round(((revenueLast30 - revenuePrevious30) / revenuePrevious30) * 1000) / 10
        : revenueLast30 > 0
          ? 100
          : 0;

    const patientsWithBookings = patientsWithActiveBookings.length;
    const patientsWithBookingsPercent =
      patientCount > 0 ? Math.round((patientsWithBookings / patientCount) * 1000) / 10 : 0;
    const patientsAskedQuestionPercent =
      patientCount > 0 ? Math.round((askDoctorQuestionCount / patientCount) * 1000) / 10 : 0;
    const savedArticlesAvgPerPatient =
      patientCount > 0 ? Math.round((publicationBookmarkCount / patientCount) * 10) / 10 : 0;
    const verifiedDoctorPercent =
      doctorCount > 0 ? Math.round((verifiedDoctorCount / doctorCount) * 1000) / 10 : 0;
    const recentRating = reviewsRecentAvg._avg.rating ?? 0;
    const previousRating = reviewsPreviousAvg._avg.rating ?? recentRating;
    const averageRatingChange = Math.round((recentRating - previousRating) * 100) / 100;

    return {
      doctorCount,
      verifiedDoctorCount,
      activeDoctorCount,
      blogCount,
      patientCount,
      userCount,
      adminCount,
      usersThisWeek,
      pendingDoctors,
      answeredQuestions,
      pendingQuestions,
      averageRating: Math.round((avgRating._avg.rating || 0) * 10) / 10,
      appointmentCount,
      completedAppointments,
      pendingAppointments,
      cancelledAppointments,
      appointmentsLast30Days,
      appointmentsGrowthPercent,
      reviewCount,
      specialtyCount: specialtyGroups.length,
      prescriptionCount,
      paymentCount: paymentAgg._count._all,
      revenueCents: paymentAgg._sum.amountCents ?? 0,
      revenueLast30DaysCents: revenueLast30,
      revenueGrowthPercent,
      paymentsLast30Days: paymentLast30Days._count._all,
      notificationCount,
      messageCount,
      newsletterCount,
      contactCount,
      patientsServed: patientsServedAgg._sum.patientsTreated ?? patientCount,
      countryCount: countryGroups.length,
      hospitalCount: hospitalGroups.length,
      patientsThisWeek,
      patientsWithActiveBookings: patientsWithBookings,
      patientsWithActiveBookingsPercent: patientsWithBookingsPercent,
      askDoctorQuestionCount,
      patientsAskedQuestionPercent,
      publicationBookmarkCount,
      savedArticlesAvgPerPatient,
      verifiedDoctorPercent,
      averageRatingChange,
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
