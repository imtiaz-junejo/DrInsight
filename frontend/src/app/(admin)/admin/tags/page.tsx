import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { TagsPageContent } from "@/components/admin/pages/TagsPageContent";

const routeId = "tags" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — DrInsight Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <TagsPageContent />;
}
