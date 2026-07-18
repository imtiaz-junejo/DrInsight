"use client";



import Link from "next/link";

import { useMemo, useState } from "react";

import {

  AdminButton,

  FilterPills,

  PanelTable,

  StatCardRow,

  StatusChip,

} from "@/components/admin/ui/AdminPrimitives";

import { adminBlogArticleHref } from "@/lib/admin-routes";

import { formatNumber } from "@/lib/admin-utils";

import { formatRelativeTime } from "@/lib/data-mappers";

import { useAdminUiStore } from "@/store/admin-ui.store";

import {

  useAdminBlogComments,

  useDeleteBlogComment,

  useUpdateBlogCommentStatus,

} from "@/services/cms-api-hooks";



const STATUS_FILTERS = [

  { label: "Pending", value: "PENDING" },

  { label: "Approved", value: "APPROVED" },

  { label: "Hidden", value: "HIDDEN" },

  { label: "Rejected", value: "REJECTED" },

  { label: "All", value: undefined },

] as const;



function commentStatusChip(status: string) {

  if (status === "APPROVED") return { label: "Approved", className: "ch-g" };

  if (status === "PENDING") return { label: "Pending", className: "ch-a" };

  if (status === "HIDDEN") return { label: "Hidden", className: "ch-gray" };

  if (status === "REJECTED") return { label: "Rejected", className: "ch-r" };

  return { label: status, className: "ch-gray" };

}



export function CommentsPageContent() {

  const showToast = useAdminUiStore((s) => s.showToast);

  const [filterIndex, setFilterIndex] = useState(0);

  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");

  const [searchInput, setSearchInput] = useState("");

  const status = STATUS_FILTERS[filterIndex]?.value;



  const commentsQuery = useAdminBlogComments({ status, page, limit: 20, search: search || undefined });

  const updateStatus = useUpdateBlogCommentStatus();

  const deleteComment = useDeleteBlogComment();

  const stats = commentsQuery.data?.stats;



  const pendingCount = stats?.pending ?? 0;

  const filters = useMemo(

    () => STATUS_FILTERS.map((f, i) => (i === 0 ? `Pending (${pendingCount})` : f.label)),

    [pendingCount],

  );



  const runStatus = (id: string, newStatus: string, message: string) => {

    updateStatus.mutate(

      { id, status: newStatus },

      { onSuccess: () => showToast(message), onError: () => showToast("Action failed") },

    );

  };



  const rows = (commentsQuery.data?.data ?? []).map((comment) => {

    const chip = commentStatusChip(comment.status);

    return [

      comment.authorName,

      <Link key={`${comment.id}-post`} href={adminBlogArticleHref(comment.post.slug)} className="cell-user-link">

        {comment.post.title}

      </Link>,

      comment.content.length > 80 ? `"${comment.content.slice(0, 80)}…"` : `"${comment.content}"`,

      formatRelativeTime(comment.createdAt),

      <StatusChip key={`${comment.id}-chip`} label={chip.label} className={chip.className} />,

      <div key={comment.id} className="btn-row">

        {comment.status !== "APPROVED" ? (

          <AdminButton variant="green" onClick={() => runStatus(comment.id, "APPROVED", "Comment approved ✓")}>

            Approve

          </AdminButton>

        ) : null}

        {comment.status !== "REJECTED" ? (

          <AdminButton variant="danger" onClick={() => runStatus(comment.id, "REJECTED", "Comment rejected")}>

            Reject

          </AdminButton>

        ) : null}

        {comment.status !== "HIDDEN" ? (

          <AdminButton onClick={() => runStatus(comment.id, "HIDDEN", "Comment hidden")}>

            Hide

          </AdminButton>

        ) : null}

        <AdminButton

          variant="danger"

          onClick={() => {

            if (!window.confirm("Delete this comment permanently?")) return;

            deleteComment.mutate(comment.id, {

              onSuccess: () => showToast("Comment deleted"),

              onError: () => showToast("Failed to delete comment"),

            });

          }}

        >

          Delete

        </AdminButton>

      </div>,

    ];

  });



  return (

    <>

      <StatCardRow

        items={[

          { ic: "ic1", icon: "💬", num: formatNumber(stats?.totalAll ?? 0), label: "Total Comments", tag: "All time", tagClass: "tt-b" },

          { ic: "ic2", icon: "✅", num: formatNumber(stats?.approved ?? 0), label: "Approved", tag: stats?.totalAll ? `${Math.round(((stats.approved ?? 0) / stats.totalAll) * 1000) / 10}%` : "—", tagClass: "tt-g" },

          { ic: "ic3", icon: "⏳", num: formatNumber(stats?.pending ?? 0), label: "Pending", tag: (stats?.pending ?? 0) > 0 ? "Action needed" : "Clear", tagClass: "tt-a" },

          { ic: "ic4", icon: "🚩", num: formatNumber(stats?.rejected ?? 0), label: "Rejected", tag: stats?.totalAll ? `${Math.round(((stats.rejected ?? 0) / stats.totalAll) * 1000) / 10}%` : "—", tagClass: "tt-r" },

        ]}

      />



      <div className="panel" style={{ marginBottom: 16 }}>

        <div className="panel-bd" style={{ display: "flex", gap: 10 }}>

          <input

            type="search"

            placeholder="Search comments, authors, articles..."

            value={searchInput}

            onChange={(e) => setSearchInput(e.target.value)}

            onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput.trim()); setPage(1); } }}

            style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--gray-200)" }}

          />

          <AdminButton onClick={() => { setSearch(searchInput.trim()); setPage(1); }}>Search</AdminButton>

        </div>

      </div>



      <FilterPills filters={filters} activeIndex={filterIndex} onChange={(i) => { setFilterIndex(i); setPage(1); }} />

      <PanelTable

        title="Comments Moderation"

        headers={["User", "Article", "Comment", "Date", "Status", "Actions"]}

        rows={rows}

        loading={commentsQuery.isLoading}

        pagerInfo={`Showing ${rows.length} comments`}

        page={page}

        totalPages={commentsQuery.data?.meta?.totalPages ?? 1}

        onPageChange={setPage}

        emptyMessage="No comments in this filter"

      />

    </>

  );

}

