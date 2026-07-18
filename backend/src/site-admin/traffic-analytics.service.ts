import { Injectable } from '@nestjs/common';
import { percentChange, resolveAnalyticsRange, trendTagClass } from '../common/utils/analytics-range.util';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrafficAnalyticsService {
  constructor(private prisma: PrismaService) {}

  private classifyReferrer(referrer: string | null): string {
    if (!referrer) return 'Direct';
    const lower = referrer.toLowerCase();
    if (lower.includes('google') || lower.includes('bing') || lower.includes('yahoo')) {
      return 'Organic Search';
    }
    if (
      lower.includes('facebook') ||
      lower.includes('twitter') ||
      lower.includes('instagram') ||
      lower.includes('linkedin')
    ) {
      return 'Social Media';
    }
    if (lower.includes('mail') || lower.includes('newsletter')) return 'Email';
    return 'Referral';
  }

  async getDashboard(query: { range?: string; from?: string; to?: string } = {}) {
    const range = resolveAnalyticsRange(query);
    const dateFilter = { gte: range.start, lte: range.end };
    const prevDateFilter = { gte: range.prevStart, lte: range.prevEnd };

    const sevenDaysAgo = new Date(range.end);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      pageViewsCurrent,
      uniqueSessionsCurrent,
      pageViewsPrevious,
      uniqueSessionsPrevious,
      pageViews7d,
      blogViews,
      publicationViews,
      durationsCurrent,
      durationsPrevious,
    ] = await Promise.all([
      this.prisma.pageView.count({ where: { createdAt: dateFilter } }),
      this.prisma.pageView.groupBy({
        by: ['sessionId'],
        where: { createdAt: dateFilter, sessionId: { not: null } },
      }),
      this.prisma.pageView.count({ where: { createdAt: prevDateFilter } }),
      this.prisma.pageView.groupBy({
        by: ['sessionId'],
        where: { createdAt: prevDateFilter, sessionId: { not: null } },
      }),
      this.prisma.pageView.findMany({
        where: { createdAt: { gte: sevenDaysAgo, lte: range.end } },
        select: { createdAt: true, sessionId: true },
      }),
      this.prisma.blogPost.aggregate({
        _sum: { viewCount: true },
      }),
      this.prisma.publication.aggregate({
        _sum: { viewCount: true },
      }),
      this.prisma.pageView.aggregate({
        where: { createdAt: dateFilter, durationSeconds: { not: null } },
        _avg: { durationSeconds: true },
      }),
      this.prisma.pageView.aggregate({
        where: { createdAt: prevDateFilter, durationSeconds: { not: null } },
        _avg: { durationSeconds: true },
      }),
    ]);

    const contentViews = (blogViews._sum.viewCount ?? 0) + (publicationViews._sum.viewCount ?? 0);
    const pageViews30d = pageViewsCurrent + contentViews;
    const prevPageViews = pageViewsPrevious;
    const uniqueVisitors = uniqueSessionsCurrent.length;
    const prevUniqueVisitors = uniqueSessionsPrevious.length;

    const avgDurationSeconds = Math.round(durationsCurrent._avg.durationSeconds ?? 0);
    const prevAvgDurationSeconds = Math.round(durationsPrevious._avg.durationSeconds ?? 0);

    const sessionPageCounts = new Map<string, number>();
    for (const view of pageViews7d) {
      if (!view.sessionId) continue;
      sessionPageCounts.set(view.sessionId, (sessionPageCounts.get(view.sessionId) ?? 0) + 1);
    }
    const bounceSessions = Array.from(sessionPageCounts.values()).filter((c) => c === 1).length;
    const bounceRate =
      uniqueVisitors > 0 ? Math.round((bounceSessions / uniqueVisitors) * 1000) / 10 : 0;

    const prevBounceViews = await this.prisma.pageView.findMany({
      where: { createdAt: prevDateFilter, sessionId: { not: null } },
      select: { sessionId: true },
    });
    const prevSessionCounts = new Map<string, number>();
    for (const view of prevBounceViews) {
      if (!view.sessionId) continue;
      prevSessionCounts.set(view.sessionId, (prevSessionCounts.get(view.sessionId) ?? 0) + 1);
    }
    const prevBounceSessions = Array.from(prevSessionCounts.values()).filter((c) => c === 1).length;
    const prevBounceRate =
      prevUniqueVisitors > 0 ? Math.round((prevBounceSessions / prevUniqueVisitors) * 1000) / 10 : 0;

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const visitorsByDay = dayLabels.map((label, index) => {
      const dayIndex = index === 6 ? 0 : index + 1;
      const count = pageViews7d.filter((v) => new Date(v.createdAt).getDay() === dayIndex).length;
      return {
        label,
        value: count,
        display: count >= 1000 ? `${(count / 1000).toFixed(1)}K` : String(count),
      };
    });

    const topPaths = await this.prisma.pageView.groupBy({
      by: ['path'],
      where: { createdAt: dateFilter },
      _count: { _all: true },
      _avg: { durationSeconds: true },
      orderBy: { _count: { path: 'desc' } },
      take: 5,
    });

    const topPages = await Promise.all(
      topPaths.map(async (row) => {
        const views = await this.prisma.pageView.findMany({
          where: { path: row.path, createdAt: dateFilter, sessionId: { not: null } },
          select: { sessionId: true },
        });
        const sessionCounts = new Map<string, number>();
        for (const view of views) {
          if (!view.sessionId) continue;
          sessionCounts.set(view.sessionId, (sessionCounts.get(view.sessionId) ?? 0) + 1);
        }
        const sessions = sessionCounts.size || 1;
        const bounces = Array.from(sessionCounts.values()).filter((count) => count === 1).length;
        const bouncePct = Math.round((bounces / sessions) * 1000) / 10;
        return [
          row.path,
          row._count._all.toLocaleString(),
          this.formatDuration(row._avg.durationSeconds ?? 0),
          `${bouncePct}%`,
        ];
      }),
    );

    const referrers = await this.prisma.pageView.findMany({
      where: { createdAt: dateFilter },
      select: { referrer: true, sessionId: true },
      take: 10000,
    });

    const sourceMap = new Map<string, Set<string>>();
    for (const row of referrers) {
      const source = this.classifyReferrer(row.referrer);
      if (!sourceMap.has(source)) sourceMap.set(source, new Set());
      if (row.sessionId) sourceMap.get(source)!.add(row.sessionId);
    }
    const totalSourceVisitors = Array.from(sourceMap.values()).reduce((sum, set) => sum + set.size, 0) || 1;
    const trafficSources = Array.from(sourceMap.entries())
      .map(([source, sessions]) => ({
        source,
        visitors: sessions.size,
        pct: Math.round((sessions.size / totalSourceVisitors) * 1000) / 10,
      }))
      .sort((a, b) => b.visitors - a.visitors);

    const pageViewsChange = percentChange(pageViews30d, prevPageViews);
    const visitorsChange = percentChange(uniqueVisitors, prevUniqueVisitors);
    const durationChange = avgDurationSeconds - prevAvgDurationSeconds;
    const bounceChange = Math.round((bounceRate - prevBounceRate) * 10) / 10;

    return {
      range: range.key,
      stats: {
        pageViews30d,
        pageViewsChange,
        pageViewsTag: `${pageViewsChange >= 0 ? '+' : ''}${pageViewsChange}%`,
        pageViewsTagClass: trendTagClass(pageViewsChange),
        uniqueVisitors,
        visitorsChange,
        visitorsTag: `${visitorsChange >= 0 ? '+' : ''}${visitorsChange}%`,
        visitorsTagClass: trendTagClass(visitorsChange),
        avgSessionDuration: this.formatDuration(avgDurationSeconds),
        durationChange,
        durationTag: durationChange === 0 ? 'Stable' : `${durationChange >= 0 ? '+' : ''}${durationChange}s`,
        durationTagClass: durationChange === 0 ? 'tt-b' : trendTagClass(durationChange),
        bounceRate: `${bounceRate}%`,
        bounceChange,
        bounceTag: `${bounceChange <= 0 ? '' : '+'}${bounceChange}%`,
        bounceTagClass: trendTagClass(bounceChange, true),
      },
      visitorsByDay,
      topPages,
      trafficSources,
    };
  }

  async recordPageView(data: {
    path: string;
    referrer?: string;
    sessionId?: string;
    durationSeconds?: number;
  }) {
    return this.prisma.pageView.create({ data });
  }

  private formatDuration(seconds: number): string {
    if (seconds <= 0) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  }
}
