import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { buildAnalyticsQuery, type AnalyticsRangeParams } from "@/lib/analytics-range";

export function useTrafficAnalytics(params: AnalyticsRangeParams) {
  return useQuery({
    queryKey: ["admin-traffic-analytics", params],
    queryFn: async () => {
      const { data } = await api.get<{
        range: string;
        stats: {
          pageViews30d: number;
          pageViewsChange: number;
          pageViewsTag: string;
          pageViewsTagClass: string;
          uniqueVisitors: number;
          visitorsChange: number;
          visitorsTag: string;
          visitorsTagClass: string;
          avgSessionDuration: string;
          durationChange: number;
          durationTag: string;
          durationTagClass: string;
          bounceRate: string;
          bounceChange: number;
          bounceTag: string;
          bounceTagClass: string;
        };
        visitorsByDay: Array<{ label: string; value: number; display: string }>;
        topPages: string[][];
        trafficSources: Array<{ source: string; visitors: number; pct: number }>;
      }>("/site-admin/analytics/traffic", { params: buildAnalyticsQuery(params) });
      return data;
    },
  });
}

export function useConsultationAnalytics(params: AnalyticsRangeParams) {
  return useQuery({
    queryKey: ["admin-consultation-analytics", params],
    queryFn: async () => {
      const { data } = await api.get<{
        range: string;
        stats: {
          consultations: number;
          consultationsChange: number;
          consultationsTag: string;
          consultationsTagClass: string;
          completionRate: number;
          completionChange: number;
          completionTag: string;
          completionTagClass: string;
          avgRating: number;
          ratingChange: number;
          ratingTag: string;
          ratingTagClass: string;
          avgDuration: number;
          durationChange: number;
          durationTag: string;
          durationTagClass: string;
        };
        consultationsByType: Array<{ label: string; count: number; pct: number }>;
        bySpecialty: Array<{ specialty: string; consultations: number; avgRating: string }>;
      }>("/site-admin/analytics/consultations", { params: buildAnalyticsQuery(params) });
      return data;
    },
  });
}

export function useRevenueAnalytics(params: AnalyticsRangeParams) {
  return useQuery({
    queryKey: ["admin-revenue-analytics", params],
    queryFn: async () => {
      const { data } = await api.get<{
        range: string;
        totalPayments: number;
        succeededPayments: number;
        failedPayments: number;
        pendingPayments: number;
        refundedPayments: number;
        totalRevenueCents: number;
        consultationRevenueCents: number;
        platformFeesCents: number;
        successRate: number;
        monthlyRevenue: Array<{ month: string; amountCents: number }>;
        dailyRevenue: Array<{ day: string; amountCents: number }>;
        pendingPayouts: Array<{
          doctorName: string;
          specialty: string;
          amountCents: number;
          period: string;
          status: string;
        }>;
        stats: {
          revenueChange: number;
          revenueTag: string;
          revenueTagClass: string;
          consultationShare: string;
          platformShare: string;
        };
      }>("/payments/admin/analytics", { params: buildAnalyticsQuery(params) });
      return data;
    },
  });
}
