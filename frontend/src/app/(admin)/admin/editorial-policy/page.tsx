import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { EditorialPolicyPageContent } from "@/components/admin/pages/EditorialPolicyPageContent";

const routeId = "editorial-policy" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — MedAuthority Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <EditorialPolicyPageContent />;
}
