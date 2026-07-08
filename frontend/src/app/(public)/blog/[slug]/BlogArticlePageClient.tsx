"use client";

import "@/styles/article-detail.css";
import { BlogArticleDetail } from "@/components/blog/BlogArticleDetail";

export default function BlogArticlePageClient({ slug }: { slug: string }) {
  return <BlogArticleDetail slug={slug} />;
}
