import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { BackupSecurityPageContent } from "@/components/admin/pages/BackupSecurityPageContent";

const routeId = "backup-security" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — DrInsight Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <BackupSecurityPageContent />;
}
