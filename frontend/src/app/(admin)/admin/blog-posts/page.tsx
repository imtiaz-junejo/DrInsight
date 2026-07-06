import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { BlogPostsPageContent } from "@/components/admin/pages/BlogPostsPageContent";

const routeId = "blog-posts" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — DrInsight Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <BlogPostsPageContent />;
}
