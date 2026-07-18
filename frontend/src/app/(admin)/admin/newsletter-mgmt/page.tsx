import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { NewsletterPageContent } from "@/components/admin/pages/NewsletterPageContent";

const routeId = "newsletter-mgmt" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — DrInsight Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <NewsletterPageContent />;
}
