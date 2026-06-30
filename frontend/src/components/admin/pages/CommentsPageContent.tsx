"use client";

import { FilterPills, PanelTable, StatCardRow } from "@/components/admin/ui/AdminPrimitives";

// TODO: connect comments moderation API when backend model exists
export function CommentsPageContent() {
  return (
    <>
      <StatCardRow
        items={[
          { ic: "ic1", icon: "💬", num: "0", label: "Total Comments", tag: "All time", tagClass: "tt-b" },
          { ic: "ic2", icon: "✅", num: "0", label: "Approved", tag: "No API", tagClass: "tt-g" },
          { ic: "ic3", icon: "⏳", num: "0", label: "Pending", tag: "No API", tagClass: "tt-a" },
          { ic: "ic4", icon: "🚩", num: "0", label: "Flagged/Removed", tag: "No API", tagClass: "tt-r" },
        ]}
      />
      <FilterPills filters={["Pending (0)", "Approved", "Flagged", "All"]} />
      <PanelTable
        title="Comments Awaiting Moderation"
        headers={["Comment", "Author", "Article", "Submitted", "Actions"]}
        rows={[]}
        emptyMessage="No comments — TODO: comments API"
      />
    </>
  );
}
