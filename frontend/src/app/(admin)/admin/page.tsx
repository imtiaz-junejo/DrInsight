import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { DashboardPageContent } from "@/components/admin/pages/DashboardPageContent";

export const metadata: Metadata = {
  title: `${adminPageMeta.dashboard[0]} — DrInsight Admin`,
  description: adminPageMeta.dashboard[1],
};

export default function AdminDashboardPage() {
  return <DashboardPageContent />;
}
