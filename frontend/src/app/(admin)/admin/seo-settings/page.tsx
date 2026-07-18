import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { SeoSettingsPageContent } from "@/components/admin/pages/SeoSettingsPageContent";

const routeId = "seo-settings" as const;

export const metadata: Metadata = {
  title: `SEO Management — DrInsight Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <SeoSettingsPageContent />;
}
