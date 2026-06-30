"use client";

import { PanelTable, StatCardRow } from "@/components/admin/ui/AdminPrimitives";
import { formatNumber } from "@/lib/admin-utils";
import { useAdminBlogPosts } from "@/services/admin-api-hooks";

// TODO: connect article review queue API when backend supports draft/review workflow
export function ReviewQueuePageContent() {
  const postsQuery = useAdminBlogPosts({ limit: 5 });

  return (
    <>
      <StatCardRow
        items={[
          { ic: "ic1", icon: "🔬", num: "0", label: "Awaiting Review", tag: "No API", tagClass: "tt-a" },
          { ic: "ic2", icon: "⏱️", num: "—", label: "Avg Days in Queue", tag: "Target: 7 days", tagClass: "tt-g" },
          { ic: "ic3", icon: "🔄", num: "0", label: "Revisions Pending", tag: "From authors", tagClass: "tt-b" },
          {
            ic: "ic4",
            icon: "✅",
            num: formatNumber(postsQuery.data?.meta.total ?? 0),
            label: "Approved (All Time)",
            tag: "Published posts",
            tagClass: "tt-g",
          },
        ]}
      />
      <PanelTable
        title="🔬 Articles Awaiting Medical Review"
        headers={["Article", "Author", "Specialty", "Assigned Reviewer", "Days Waiting", "Status", "Actions"]}
        rows={[]}
        emptyMessage="No articles in review queue — TODO: review queue API"
      />
    </>
  );
}
