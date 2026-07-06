import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { AuthorGuidelinesPageContent } from "@/components/admin/pages/AuthorGuidelinesPageContent";

const routeId = "author-guidelines" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — DrInsight Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <AuthorGuidelinesPageContent />;
}
