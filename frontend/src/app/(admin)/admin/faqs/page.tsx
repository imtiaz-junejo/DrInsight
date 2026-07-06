import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { FaqsPageContent } from "@/components/admin/pages/FaqsPageContent";

const routeId = "faqs" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — DrInsight Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <FaqsPageContent />;
}
