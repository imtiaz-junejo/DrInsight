"use client";

import { PanelTable, StatCardRow, StatusChip } from "@/components/admin/ui/AdminPrimitives";
import { formatNumber } from "@/lib/admin-utils";
import { formatDate, formatRelativeTime } from "@/lib/data-mappers";
import { useAdminBlogPosts } from "@/services/admin-api-hooks";

export function ReviewQueuePageContent() {
  const draftQuery = useAdminBlogPosts({ limit: 50, status: "DRAFT" });
  const publishedQuery = useAdminBlogPosts({ limit: 1, status: "PUBLISHED" });
  const drafts = draftQuery.data?.data ?? [];

  const rows = drafts.map((post) => [
    post.title,
    post.author ? `${post.author.firstName} ${post.author.lastName}` : "—",
    post.category?.name ?? "—",
    "Unassigned",
    post.createdAt ? formatRelativeTime(post.createdAt) : post.publishedAt ? formatDate(post.publishedAt) : "—",
    <StatusChip key={post.id} label="Draft" className="sc-pend" />,
    "Awaiting review",
  ]);

  return (
    <>
      <StatCardRow
        items={[
          {
            ic: "ic1",
            icon: "🔬",
            num: draftQuery.isLoading ? "—" : formatNumber(draftQuery.data?.meta.total ?? drafts.length),
            label: "Awaiting Review",
            tag: "Draft posts",
            tagClass: "tt-a",
          },
          {
            ic: "ic2",
            icon: "⏱️",
            num: String(drafts.length),
            label: "In Queue Now",
            tag: "Live data",
            tagClass: "tt-g",
          },
          {
            ic: "ic3",
            icon: "🔄",
            num: formatNumber(drafts.filter((p) => p.status === "DRAFT").length),
            label: "Revisions Pending",
            tag: "From authors",
            tagClass: "tt-b",
          },
          {
            ic: "ic4",
            icon: "✅",
            num: formatNumber(publishedQuery.data?.meta.total ?? 0),
            label: "Approved (All Time)",
            tag: "Published posts",
            tagClass: "tt-g",
          },
        ]}
      />
      <PanelTable
        title="🔬 Articles Awaiting Medical Review"
        headers={["Article", "Author", "Specialty", "Assigned Reviewer", "Days Waiting", "Status", "Actions"]}
        rows={rows}
        loading={draftQuery.isLoading}
        emptyMessage="No articles in review queue"
      />
    </>
  );
}
