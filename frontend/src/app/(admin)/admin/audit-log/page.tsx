import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { AuditLogPageContent } from "@/components/admin/pages/AuditLogPageContent";

const routeId = "audit-log" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — MedAuthority Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <AuditLogPageContent />;
}
