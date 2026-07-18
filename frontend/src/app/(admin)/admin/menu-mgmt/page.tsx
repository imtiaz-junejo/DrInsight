import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { MenuMgmtPageContent } from "@/components/admin/pages/MenuMgmtPageContent";

const routeId = "menu-mgmt" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — DrInsight Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <MenuMgmtPageContent />;
}
