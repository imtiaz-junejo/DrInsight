import type { Metadata } from "next";
import { BlogArticleDetailPageContent } from "@/components/admin/pages/BlogArticleDetailPageContent";

export const metadata: Metadata = {
  title: "Article Details — DrInsight Admin",
  robots: { index: false, follow: false },
};

export default async function AdminBlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BlogArticleDetailPageContent slug={slug} />;
}
