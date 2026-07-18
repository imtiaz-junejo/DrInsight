import { Injectable } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { percentChange, resolveAnalyticsRange, trendTagClass } from '../common/utils/analytics-range.util';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConsultationAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(query: { range?: string; from?: string; to?: string }) {
    const range = resolveAnalyticsRange(query);
    const dateFilter = { gte: range.start, lte: range.end };
    const prevDateFilter = { gte: range.prevStart, lte: range.prevEnd };

    const [
      appointments,
      prevAppointments,
      reviews,
      prevReviews,
    ] = await Promise.all([
      this.prisma.appointment.findMany({
        where: { scheduledAt: dateFilter },
        select: {
          status: true,
          consultationType: true,
          durationMinutes: true,
          doctor: { select: { specialty: true } },
        },
      }),
      this.prisma.appointment.findMany({
        where: { scheduledAt: prevDateFilter },
        select: { status: true, durationMinutes: true },
      }),
      this.prisma.review.findMany({
        where: { createdAt: dateFilter },
        select: { rating: true, doctor: { select: { specialty: true } } },
      }),
      this.prisma.review.aggregate({
        where: { createdAt: prevDateFilter },
        _avg: { rating: true },
      }),
    ]);

    const total = appointments.length;
    const prevTotal = prevAppointments.length;
    const completed = appointments.filter((a) => a.status === AppointmentStatus.COMPLETED).length;
    const prevCompleted = prevAppointments.filter((a) => a.status === AppointmentStatus.COMPLETED).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 1000) / 10 : 0;
    const prevCompletionRate =
      prevTotal > 0 ? Math.round((prevCompleted / prevTotal) * 1000) / 10 : 0;

    const avgDuration =
      total > 0
        ? Math.round(appointments.reduce((sum, a) => sum + (a.durationMinutes || 0), 0) / total)
        : 0;
    const prevAvgDuration =
      prevTotal > 0
        ? Math.round(prevAppointments.reduce((sum, a) => sum + (a.durationMinutes || 0), 0) / prevTotal)
        : 0;

    const avgRating =
      reviews.length > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 100) / 100
        : 0;
    const prevAvgRating = prevReviews._avg.rating ?? 0;
    const ratingChange = Math.round((avgRating - prevAvgRating) * 100) / 100;

    const typeCounts = { VIDEO: 0, AUDIO: 0, CHAT: 0, IN_PERSON: 0 };
    for (const appt of appointments) {
      if (appt.consultationType in typeCounts) {
        typeCounts[appt.consultationType as keyof typeof typeCounts] += 1;
      }
    }
    const typeSum = Object.values(typeCounts).reduce((a, b) => a + b, 0) || 1;
    const consultationsByType = [
      { label: '📹 Video', count: typeCounts.VIDEO, pct: Math.round((typeCounts.VIDEO / typeSum) * 1000) / 10 },
      { label: '📞 Phone', count: typeCounts.AUDIO, pct: Math.round((typeCounts.AUDIO / typeSum) * 1000) / 10 },
      { label: '💬 Chat', count: typeCounts.CHAT, pct: Math.round((typeCounts.CHAT / typeSum) * 1000) / 10 },
    ].filter((row) => row.count > 0 || typeSum === 1);

    const specialtyMap = new Map<string, { count: number; ratings: number[] }>();
    for (const appt of appointments) {
      const specialty = appt.doctor?.specialty ?? 'Unknown';
      if (!specialtyMap.has(specialty)) specialtyMap.set(specialty, { count: 0, ratings: [] });
      specialtyMap.get(specialty)!.count += 1;
    }
    for (const review of reviews) {
      const specialty = review.doctor?.specialty ?? 'Unknown';
      if (!specialtyMap.has(specialty)) specialtyMap.set(specialty, { count: 0, ratings: [] });
      specialtyMap.get(specialty)!.ratings.push(review.rating);
    }

    const bySpecialty = Array.from(specialtyMap.entries())
      .map(([specialty, data]) => ({
        specialty,
        consultations: data.count,
        avgRating:
          data.ratings.length > 0
            ? (Math.round((data.ratings.reduce((s, r) => s + r, 0) / data.ratings.length) * 100) / 100).toFixed(2)
            : '—',
      }))
      .sort((a, b) => b.consultations - a.consultations)
      .slice(0, 10);

    const consultationsChange = percentChange(total, prevTotal);
    const completionChange = Math.round((completionRate - prevCompletionRate) * 10) / 10;
    const durationChange = avgDuration - prevAvgDuration;

    return {
      range: range.key,
      stats: {
        consultations: total,
        consultationsChange,
        consultationsTag: `${consultationsChange >= 0 ? '+' : ''}${consultationsChange}%`,
        consultationsTagClass: trendTagClass(consultationsChange),
        completionRate,
        completionChange,
        completionTag: `${completionChange >= 0 ? '+' : ''}${completionChange}%`,
        completionTagClass: trendTagClass(completionChange),
        avgRating,
        ratingChange,
        ratingTag: ratingChange === 0 ? 'Stable' : `${ratingChange >= 0 ? '+' : ''}${ratingChange}`,
        ratingTagClass: trendTagClass(ratingChange),
        avgDuration,
        durationChange,
        durationTag: durationChange === 0 ? 'Stable' : `${durationChange >= 0 ? '+' : ''}${durationChange} min`,
        durationTagClass: durationChange === 0 ? 'tt-b' : trendTagClass(durationChange),
      },
      consultationsByType,
      bySpecialty,
    };
  }
}
