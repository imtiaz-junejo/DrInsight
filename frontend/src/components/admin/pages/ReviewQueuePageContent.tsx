"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AssignmentModal } from "@/components/admin/editorial/AssignmentModal";
import { ReviewStatusBadge } from "@/components/admin/editorial/ReviewStatusBadge";
import {
  AdminButton,
  AdminPagination,
  AdminPanel,
  AdminTable,
  FilterPills,
  StatCardRow,
} from "@/components/admin/ui/AdminPrimitives";
import { adminUserProfileHref } from "@/lib/admin-routes";
import { formatNumber } from "@/lib/admin-utils";
import { formatDate, formatRelativeTime } from "@/lib/data-mappers";
import {
  PRIORITY_LABELS,
  useArticleReviewAction,
  useArticleReviewQueue,
  useArticleReviewStats,
  useBulkArticleReviewAction,
  useMedicalReviewers,
  type ArticleReviewPost,
  type ArticleReviewStatus,
  type ReviewPriority,
} from "@/services/editorial-api-hooks";
import { useAdminUiStore } from "@/store/admin-ui.store";

const STATUS_FILTERS = ["All", "Pending", "In Review", "Needs Revision", "Approved", "Rejected", "Published"] as const;
const STATUS_MAP: Record<(typeof STATUS_FILTERS)[number], ArticleReviewStatus | undefined> = {
  All: undefined,
  Pending: "SUBMITTED",
  "In Review": "UNDER_MEDICAL_REVIEW",
  "Needs Revision": "NEEDS_REVISION",
  Approved: "APPROVED",
  Rejected: "REJECTED",
  Published: "PUBLISHED",
};

const PRIORITY_FILTERS = ["All Priorities", "Urgent", "High", "Normal", "Low"] as const;
const PRIORITY_MAP: Record<(typeof PRIORITY_FILTERS)[number], ReviewPriority | undefined> = {
  "All Priorities": undefined,
  Urgent: "URGENT",
  High: "HIGH",
  Normal: "NORMAL",
  Low: "LOW",
};

function avgDaysInQueue(posts: ArticleReviewPost[]) {
  const dated = posts.filter((p) => p.submittedAt || p.createdAt);
  if (!dated.length) return "0";
  const total = dated.reduce((sum, p) => {
    const d = new Date(p.submittedAt ?? p.createdAt).getTime();
    return sum + Math.max(0, Date.now() - d);
  }, 0);
  return (total / dated.length / (1000 * 60 * 60 * 24)).toFixed(1);
}

export function ReviewQueuePageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusIdx, setStatusIdx] = useState(0);
  const [priorityIdx, setPriorityIdx] = useState(0);
  const [sort, setSort] = useState("newest");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [assignPost, setAssignPost] = useState<ArticleReviewPost | null>(null);
  const [notesPost, setNotesPost] = useState<ArticleReviewPost | null>(null);
  const [notes, setNotes] = useState("");

  const statsQuery = useArticleReviewStats();
  const queueQuery = useArticleReviewQueue({
    page,
    limit: 20,
    search: search || undefined,
    status: STATUS_MAP[STATUS_FILTERS[statusIdx]],
    priority: PRIORITY_MAP[PRIORITY_FILTERS[priorityIdx]],
    sort,
  });
  const reviewersQuery = useMedicalReviewers();
  const actionMutation = useArticleReviewAction();
  const bulkMutation = useBulkArticleReviewAction();

  const posts = queueQuery.data?.data ?? [];
  const meta = queueQuery.data?.meta;
  const stats = statsQuery.data;

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const runAction = async (
    postId: string,
    action: Parameters<typeof actionMutation.mutateAsync>[0]["action"],
    extra?: Partial<Parameters<typeof actionMutation.mutateAsync>[0]>,
  ) => {
    try {
      await actionMutation.mutateAsync({ postId, action, ...extra });
      const labels: Record<string, string> = {
        APPROVE: "Approved ✓",
        REJECT: "Article rejected",
        REQUEST_REVISION: "Revision requested",
        PUBLISH: "Published ✓",
        UNPUBLISH: "Unpublished",
        ARCHIVE: "Archived",
        ASSIGN_REVIEWER: "Reviewer assigned",
        DELETE: "Article deleted",
        FEATURE: "Featured",
        PIN: "Pinned",
      };
      showToast(labels[action] ?? "Action completed");
      setAssignPost(null);
      setNotesPost(null);
    } catch {
      showToast("Action failed");
    }
  };

  const tableRows = useMemo(
    () =>
      posts.map((post) => {
        const reviewerName = post.reviewer
          ? `${post.reviewer.firstName} ${post.reviewer.lastName}`
          : "Unassigned";
        return [
          <input
            key={`${post.id}-cb`}
            type="checkbox"
            checked={selected.has(post.id)}
            onChange={() => toggleSelect(post.id)}
          />,
          <Link key={`${post.id}-title`} href={`/admin/blog/${post.slug}`} className="cell-user-link">
            <strong>{post.title}</strong>
          </Link>,
          post.category?.name ?? "—",
          post.author?.id ? (
            <Link key={`${post.id}-author`} href={adminUserProfileHref(post.author.id)} className="cell-user-link">
              {post.author.firstName} {post.author.lastName}
            </Link>
          ) : (
            "—"
          ),
          reviewerName,
          post.submittedAt ? formatDate(post.submittedAt) : formatDate(post.createdAt),
          formatRelativeTime(post.updatedAt),
          <ReviewStatusBadge key={`${post.id}-st`} status={post.status} />,
          PRIORITY_LABELS[post.reviewPriority] ?? post.reviewPriority,
          <div key={`${post.id}-actions`} className="btn-row">
            <AdminButton onClick={() => window.open(`/blog/${post.slug}`, "_blank")}>View</AdminButton>
            <AdminButton onClick={() => window.open(`/blog/${post.slug}`, "_blank")}>Preview</AdminButton>
            {!post.reviewer ? (
              <AdminButton onClick={() => setAssignPost(post)}>Assign Reviewer</AdminButton>
            ) : (
              <>
                <AdminButton variant="green" onClick={() => runAction(post.id, "APPROVE")}>
                  Approve
                </AdminButton>
                <AdminButton variant="danger" onClick={() => setNotesPost(post)}>
                  Reject
                </AdminButton>
                <AdminButton onClick={() => setNotesPost(post)}>Request Revision</AdminButton>
              </>
            )}
            {post.status === "APPROVED" ? (
              <AdminButton variant="green" onClick={() => runAction(post.id, "PUBLISH")}>
                Publish
              </AdminButton>
            ) : null}
            {post.status === "PUBLISHED" ? (
              <AdminButton onClick={() => runAction(post.id, "UNPUBLISH")}>Unpublish</AdminButton>
            ) : null}
            <AdminButton onClick={() => runAction(post.id, "ARCHIVE")}>Archive</AdminButton>
            <AdminButton onClick={() => runAction(post.id, post.featured ? "UNFEATURE" : "FEATURE")}>
              {post.featured ? "Unfeature" : "Feature"}
            </AdminButton>
            <AdminButton onClick={() => runAction(post.id, post.pinned ? "UNPIN" : "PIN")}>
              {post.pinned ? "Unpin" : "Pin"}
            </AdminButton>
            <AdminButton variant="danger" onClick={() => runAction(post.id, "DELETE")}>
              Delete
            </AdminButton>
          </div>,
        ];
      }),
    [posts, selected],
  );

  return (
    <>
      <StatCardRow
        items={[
          {
            ic: "ic1",
            icon: "🔬",
            num: statsQuery.isLoading ? "—" : formatNumber(stats?.pending ?? 0),
            label: "Total Pending",
            tag: "Action needed",
            tagClass: "tt-a",
          },
          {
            ic: "ic2",
            icon: "🩺",
            num: statsQuery.isLoading ? "—" : formatNumber(stats?.underMedicalReview ?? 0),
            label: "Under Medical Review",
            tag: "Active reviews",
            tagClass: "tt-b",
          },
          {
            ic: "ic3",
            icon: "✅",
            num: statsQuery.isLoading ? "—" : formatNumber(stats?.approved ?? 0),
            label: "Approved",
            tag: `${formatNumber(stats?.published ?? 0)} published`,
            tagClass: "tt-g",
          },
          {
            ic: "ic4",
            icon: "🔄",
            num: statsQuery.isLoading ? "—" : formatNumber(stats?.needsRevision ?? 0),
            label: "Needs Revision",
            tag: `${formatNumber(stats?.rejected ?? 0)} rejected`,
            tagClass: "tt-r",
          },
        ]}
      />

      <AdminPanel title="🔬 Article Review Queue" bodyClassName="panel-bd">
        <div className="search-bar">
          <input
            placeholder="Search articles, authors..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setSearch(searchInput), setPage(1))}
          />
          <AdminButton onClick={() => (setSearch(searchInput), setPage(1))}>Search</AdminButton>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="priority">Priority</option>
            <option value="title">Title A–Z</option>
            <option value="updated">Last updated</option>
          </select>
        </div>
        <FilterPills
          filters={[...STATUS_FILTERS]}
          activeIndex={statusIdx}
          onChange={(i) => {
            setStatusIdx(i);
            setPage(1);
          }}
        />
        <FilterPills
          filters={[...PRIORITY_FILTERS]}
          activeIndex={priorityIdx}
          onChange={(i) => {
            setPriorityIdx(i);
            setPage(1);
          }}
        />

        {selected.size > 0 ? (
          <div className="bulk-bar">
            <span>{selected.size} selected</span>
            <AdminButton
              variant="green"
              onClick={() =>
                bulkMutation.mutate(
                  { postIds: [...selected], action: "APPROVE" },
                  { onSuccess: () => (showToast("Bulk approve complete"), setSelected(new Set())) },
                )
              }
            >
              Bulk Approve
            </AdminButton>
            <AdminButton
              onClick={() =>
                bulkMutation.mutate(
                  { postIds: [...selected], action: "ARCHIVE" },
                  { onSuccess: () => (showToast("Bulk archive complete"), setSelected(new Set())) },
                )
              }
            >
              Bulk Archive
            </AdminButton>
          </div>
        ) : null}

        <AdminTable
          headers={[
            "",
            "Article Title",
            "Category",
            "Author",
            "Medical Reviewer",
            "Submitted Date",
            "Last Updated",
            "Status",
            "Priority",
            "Actions",
          ]}
          rows={tableRows}
          loading={queueQuery.isLoading}
          emptyMessage="No articles in review queue"
        />

        {meta && meta.totalPages > 1 ? (
          <AdminPagination
            info={`Showing ${posts.length} of ${meta.total} articles · Avg ${avgDaysInQueue(posts)} days in queue`}
            page={meta.page}
            totalPages={meta.totalPages}
            onPageChange={setPage}
          />
        ) : (
          <div className="pager">
            <span>
              Showing {posts.length} articles
              {posts.length ? ` · Avg ${avgDaysInQueue(posts)} days in queue` : ""}
            </span>
          </div>
        )}
      </AdminPanel>

      {assignPost ? (
        <AssignmentModal
          title={`Assign Reviewer — ${assignPost.title}`}
          reviewers={reviewersQuery.data ?? []}
          loading={actionMutation.isPending}
          onClose={() => setAssignPost(null)}
          onAssign={(reviewerId) =>
            runAction(assignPost.id, assignPost.reviewer ? "REASSIGN_REVIEWER" : "ASSIGN_REVIEWER", { reviewerId })
          }
        />
      ) : null}

      {notesPost ? (
        <div className="modal-overlay" onClick={() => setNotesPost(null)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-hd">
              <h3>Review Notes</h3>
              <button type="button" className="modal-close" onClick={() => setNotesPost(null)}>
                ✕
              </button>
            </div>
            <div className="modal-bd">
              <p style={{ fontSize: "0.84rem", marginBottom: 8 }}>
                <strong>{notesPost.title}</strong>
              </p>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Feedback for the author..."
              />
            </div>
            <div className="modal-ft">
              <AdminButton onClick={() => setNotesPost(null)}>Cancel</AdminButton>
              <AdminButton
                variant="danger"
                onClick={() => runAction(notesPost.id, "REJECT", { notes })}
              >
                Reject
              </AdminButton>
              <AdminButton onClick={() => runAction(notesPost.id, "REQUEST_REVISION", { notes })}>
                Request Revision
              </AdminButton>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
