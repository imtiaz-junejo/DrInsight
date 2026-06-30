import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { ConsultationAnalyticsPageContent } from "@/components/admin/pages/ConsultationAnalyticsPageContent";

const routeId = "consultation-analytics" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — MedAuthority Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <ConsultationAnalyticsPageContent />;
}
