import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { PrescriptionsPageContent } from "@/components/admin/pages/PrescriptionsPageContent";

const routeId = "prescriptions" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — DrInsight Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <PrescriptionsPageContent />;
}
