import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { BrandingMediaPageContent } from "@/components/admin/pages/BrandingMediaPageContent";

const routeId = "branding-media" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — DrInsight Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <BrandingMediaPageContent />;
}
