import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { ReviewQueuePageContent } from "@/components/admin/pages/ReviewQueuePageContent";

const routeId = "review-queue" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — DrInsight Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <ReviewQueuePageContent />;
}
