import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { RolesPageContent } from "@/components/admin/pages/RolesPageContent";

const routeId = "roles" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — DrInsight Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <RolesPageContent />;
}
