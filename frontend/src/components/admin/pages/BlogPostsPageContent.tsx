"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AdminButton,
  FilterPills,
  PanelTable,
  StatCardRow,
  StatusChip,
} from "@/components/admin/ui/AdminPrimitives";
import { blogStatusChip, formatNumber } from "@/lib/admin-utils";
import { useAdminUiStore } from "@/store/admin-ui.store";
import { useAdminBlogCategories, useAdminBlogPosts } from "@/services/admin-api-hooks";

export function BlogPostsPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const [filterIndex, setFilterIndex] = useState(0);
  const [page, setPage] = useState(1);
  const postsQuery = useAdminBlogPosts({ page, limit: 10 });
  const categoriesQuery = useAdminBlogCategories();

  const posts = postsQuery.data?.data ?? [];
  const meta = postsQuery.data?.meta;

  const rows = posts.map((post) => {
    const status = blogStatusChip((post as { status?: string }).status ?? "PUBLISHED");
    const author = post.author ? `Dr. ${post.author.firstName} ${post.author.lastName}` : "—";
    return [
      post.title,
      author,
      post.category?.name ?? "—",
      "—",
      <StatusChip key={`${post.id}-s`} label={status.label} className={status.className} />,
      post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
      <div key={`${post.id}-a`} className="btn-row">
        <AdminButton onClick={() => showToast("Opening editor...")}>Edit</AdminButton>
        <Link href="/admin/review-queue" className="btn">
          Review
        </Link>
      </div>,
    ];
  });

  return (
    <>
      <StatCardRow
        items={[
          {
            ic: "ic1",
            icon: "📰",
            num: formatNumber(meta?.total ?? 0),
            label: "Total Articles",
            tag: `${categoriesQuery.data?.length ?? 0} categories`,
            tagClass: "tt-b",
          },
          { ic: "ic2", icon: "✅", num: formatNumber(meta?.total ?? 0), label: "Published", tag: "API: published only", tagClass: "tt-g" },
          { ic: "ic3", icon: "🔬", num: "—", label: "In Review", tag: "No API", tagClass: "tt-a" },
          { ic: "ic4", icon: "📝", num: "—", label: "Drafts", tag: "No API", tagClass: "tt-gray" },
        ]}
      />
      <FilterPills filters={["All", "Published", "In Review", "Drafts", "Scheduled", "Unpublished"]} activeIndex={filterIndex} onChange={setFilterIndex} />
      <PanelTable
        title="All Articles"
        actions={
          <AdminButton variant="primary" onClick={() => showToast("Opening new article form...")}>
            + New Article
          </AdminButton>
        }
        headers={["Title", "Author", "Category", "Reviewer", "Status", "Published", "Actions"]}
        rows={rows}
        loading={postsQuery.isLoading}
        pagerInfo={`Showing ${rows.length} of ${meta?.total ?? 0} articles`}
        page={page}
        totalPages={meta?.totalPages ?? 1}
        onPageChange={setPage}
        emptyMessage="No blog posts found"
      />
    </>
  );
}
