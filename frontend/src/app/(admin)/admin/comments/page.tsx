import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { CommentsPageContent } from "@/components/admin/pages/CommentsPageContent";

const routeId = "comments" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — DrInsight Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <CommentsPageContent />;
}
