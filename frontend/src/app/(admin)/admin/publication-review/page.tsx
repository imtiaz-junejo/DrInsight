import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { PublicationReviewPageContent } from "@/components/admin/pages/PublicationReviewPageContent";

const routeId = "publication-review" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — DrInsight Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPublicationReviewPage() {
  return <PublicationReviewPageContent />;
}
