import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { RevenueAnalyticsPageContent } from "@/components/admin/pages/RevenueAnalyticsPageContent";

const routeId = "revenue-analytics" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — DrInsight Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <RevenueAnalyticsPageContent />;
}
