import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { AppointmentsPageContent } from "@/components/admin/pages/AppointmentsPageContent";

const routeId = "appointments" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — DrInsight Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <AppointmentsPageContent />;
}
