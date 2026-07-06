import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { HomepageSectionsPageContent } from "@/components/admin/pages/HomepageSectionsPageContent";

const routeId = "homepage-sections" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — DrInsight Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <HomepageSectionsPageContent />;
}
