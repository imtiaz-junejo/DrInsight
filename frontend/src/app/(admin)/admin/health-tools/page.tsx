import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { HealthToolsPageContent } from "@/components/admin/pages/HealthToolsPageContent";

const routeId = "health-tools" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — MedAuthority Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <HealthToolsPageContent />;
}
