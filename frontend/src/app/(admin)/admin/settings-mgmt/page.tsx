import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { SettingsMgmtPageContent } from "@/components/admin/pages/SettingsMgmtPageContent";

const routeId = "settings-mgmt" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — DrInsight Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <SettingsMgmtPageContent />;
}
