import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { ConsultRequestsPageContent } from "@/components/admin/pages/ConsultRequestsPageContent";

const routeId = "consult-requests" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — MedAuthority Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <ConsultRequestsPageContent />;
}
