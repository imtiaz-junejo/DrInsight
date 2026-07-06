import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { TrustedPartnersPageContent } from "@/components/admin/pages/TrustedPartnersPageContent";

const routeId = "trusted-partners" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — DrInsight Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <TrustedPartnersPageContent />;
}
