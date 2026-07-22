"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import "@/styles/research-article-preview.css";
import { AssignmentModal } from "@/components/admin/editorial/AssignmentModal";
import {
  ResearchArticlePreview,
  publicationToPreviewData,
} from "@/components/publications/PublicationPreview";
import {
  AdminButton,
  AdminPanel,
  AdminPagination,
  AdminTable,
  FilterPills,
  FormGrid,
  FormItem,
  PanelLink,
  StatCardRow,
  StatusChip,
} from "@/components/admin/ui/AdminPrimitives";
import { adminDoctorProfileHref } from "@/lib/admin-routes";
import { formatNumber } from "@/lib/admin-utils";
import { formatDate, formatRelativeTime } from "@/lib/data-mappers";
import {
  type Publication,
  type PublicationStatus,
  type PublicationType,
  type PublicationVisibility,
  PUBLICATION_STATUS_LABELS,
  PUBLICATION_TYPE_LABELS,
  publicationPdfUrl,
  useAdminPublicationStats,
  useAdminPublications,
  useReviewPublication,
  useUpdatePublicationFlags,
} from "@/services/publications-api-hooks";
import { useMedicalReviewers } from "@/services/editorial-api-hooks";
import { useAdminUiStore } from "@/store/admin-ui.store";

const QUEUE_STATUSES: PublicationStatus[] = ["SUBMITTED", "UNDER_REVIEW", "NEEDS_REVISION"];

const STATUS_FILTERS = ["Queue", "All", "Submitted", "Under Review", "Needs Revision", "Approved", "Rejected"] as const;
const STATUS_FILTER_MAP: Record<(typeof STATUS_FILTERS)[number], PublicationStatus | "QUEUE" | "ALL"> = {
  Queue: "QUEUE",
  All: "ALL",
  Submitted: "SUBMITTED",
  "Under Review": "UNDER_REVIEW",
  "Needs Revision": "NEEDS_REVISION",
  Approved: "APPROVED",
  Rejected: "REJECTED",
};

const TYPE_FILTERS = ["All Types", "Evidence Review", "Clinical Explainer", "Meta-Summary", "Practice Guide", ...Object.values(PUBLICATION_TYPE_LABELS).filter((label) => !["Evidence Review", "Clinical Explainer", "Meta-Summary", "Practice Guide"].includes(label))] as const;

const PEER_REVIEW_OUTCOMES = [
  "Accepted",
  "Accepted with minor revisions",
  "Major revisions required",
  "Rejected",
] as const;

function statusChipClass(status: PublicationStatus): string {
  switch (status) {
    case "APPROVED":
      return "ch-g";
    case "REJECTED":
    case "NEEDS_REVISION":
      return "ch-r";
    case "UNDER_REVIEW":
    case "SUBMITTED":
      return "ch-a";
    default:
      return "ch-gray";
  }
}

function doctorName(pub: Publication): string {
  const user = pub.doctor?.user;
  if (user) return `Dr. ${user.firstName} ${user.lastName}`;
  return pub.correspondingAuthor ?? "—";
}

function daysWaiting(pub: Publication): string {
  const date = pub.submittedAt ?? pub.createdAt;
  if (!date) return "—";
  const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "<1 day";
  return `${days} day${days === 1 ? "" : "s"}`;
}

function reviewerName(pub: Publication): string {
  if (pub.assignedReviewer) return `${pub.assignedReviewer.firstName} ${pub.assignedReviewer.lastName}`;
  if (pub.reviewingPhysician) return pub.reviewingPhysician;
  return "Unassigned";
}

function avgQueueDays(pubs: Publication[]): number {
  const dated = pubs.filter((p) => p.submittedAt);
  if (!dated.length) return 0;
  const totalMs = dated.reduce((sum, p) => sum + Date.now() - new Date(p.submittedAt!).getTime(), 0);
  return totalMs / dated.length / (1000 * 60 * 60 * 24);
}

export function PublicationReviewPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const [page, setPage] = useState(1);
  const [statusFilterIndex, setStatusFilterIndex] = useState(0);
  const [typeFilterIndex, setTypeFilterIndex] = useState(0);
  const [assignPub, setAssignPub] = useState<Publication | null>(null);
  const [detailPub, setDetailPub] = useState<Publication | null>(null);
  const [workspacePub, setWorkspacePub] = useState<Publication | null>(null);
  const [reviewPub, setReviewPub] = useState<Publication | null>(null);
  const [reviewAction, setReviewAction] = useState<"APPROVE" | "REJECT" | "REQUEST_REVISION">("APPROVE");
  const [internalNotes, setInternalNotes] = useState("");
  const [feedback, setFeedback] = useState("");
  const [visibility, setVisibility] = useState<PublicationVisibility>("PUBLIC");
  const [featured, setFeatured] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [reviewingPhysician, setReviewingPhysician] = useState("");
  const [lastReviewedDate, setLastReviewedDate] = useState("");
  const [peerReviewOutcome, setPeerReviewOutcome] = useState("Accepted with minor revisions");
  const [nextScheduledReview, setNextScheduledReview] = useState("");
  const [evidenceGrade, setEvidenceGrade] = useState("");
  const [editorialOpenAccess, setEditorialOpenAccess] = useState(true);
  const [editorialPeerReviewed, setEditorialPeerReviewed] = useState(true);

  const statusFilter = STATUS_FILTER_MAP[STATUS_FILTERS[statusFilterIndex]];
  const typeLabel = TYPE_FILTERS[typeFilterIndex];
  const typeFilter =
    typeFilterIndex === 0
      ? undefined
      : (Object.entries(PUBLICATION_TYPE_LABELS).find(([, label]) => label === typeLabel)?.[0] as PublicationType);

  const statsQuery = useAdminPublicationStats();
  const revisionsQuery = useAdminPublications({ status: "NEEDS_REVISION", limit: 1 });
  const queueQuery = useAdminPublications({
    page,
    limit: 20,
    status: statusFilter !== "QUEUE" && statusFilter !== "ALL" ? statusFilter : undefined,
    publicationType: typeFilter,
  });
  const recentQuery = useAdminPublications({ status: "APPROVED", limit: 5, sort: "newest" });
  const reviewMutation = useReviewPublication();
  const flagsMutation = useUpdatePublicationFlags();
  const reviewersQuery = useMedicalReviewers();

  const queueItems = useMemo(() => {
    const rows = queueQuery.data?.data ?? [];
    if (statusFilter === "QUEUE") {
      return rows.filter((p) => QUEUE_STATUSES.includes(p.status));
    }
    return rows;
  }, [queueQuery.data, statusFilter]);

  const avgDays = useMemo(() => avgQueueDays(queueItems), [queueItems]);
  const meta = queueQuery.data?.meta;
  const revisionsCount = revisionsQuery.data?.meta.total ?? 0;

  const openWorkspace = (pub: Publication) => {
    setWorkspacePub(pub);
    setReviewingPhysician(pub.reviewingPhysician ?? "");
    setLastReviewedDate(pub.lastReviewedDate?.slice(0, 10) ?? "");
    setPeerReviewOutcome(pub.peerReviewOutcome ?? "Accepted with minor revisions");
    setNextScheduledReview(pub.nextScheduledReview?.slice(0, 10) ?? "");
    setEvidenceGrade(pub.evidenceGrade ?? "");
    setEditorialOpenAccess(pub.openAccess);
    setEditorialPeerReviewed(pub.physicianReviewed);
  };

  const workspacePreviewData = useMemo(() => {
    if (!workspacePub) return null;
    const data = publicationToPreviewData(workspacePub);
    data.editorial = {
      ...data.editorial,
      reviewingPhysician: reviewingPhysician || data.editorial?.reviewingPhysician,
      lastReviewedDate: lastReviewedDate || data.editorial?.lastReviewedDate,
      peerReviewOutcome: peerReviewOutcome || data.editorial?.peerReviewOutcome,
      nextScheduledReview: nextScheduledReview || data.editorial?.nextScheduledReview,
      evidenceGrade: evidenceGrade || data.editorial?.evidenceGrade,
      openAccess: editorialOpenAccess,
      physicianReviewed: editorialPeerReviewed,
      downloadCount: workspacePub.downloadCount,
      citationCount: workspacePub.citationCount,
    };
    return data;
  }, [
    workspacePub,
    reviewingPhysician,
    lastReviewedDate,
    peerReviewOutcome,
    nextScheduledReview,
    evidenceGrade,
    editorialOpenAccess,
    editorialPeerReviewed,
  ]);

  const openReview = (pub: Publication, action: "APPROVE" | "REJECT" | "REQUEST_REVISION") => {
    setReviewPub(pub);
    setReviewAction(action);
    setInternalNotes("");
    setFeedback("");
    setVisibility(pub.visibility ?? "PUBLIC");
    setFeatured(pub.featured);
    setPinned(pub.pinned);
    setReviewingPhysician(pub.reviewingPhysician ?? reviewingPhysician);
    setLastReviewedDate(pub.lastReviewedDate?.slice(0, 10) ?? lastReviewedDate);
    setPeerReviewOutcome(pub.peerReviewOutcome ?? peerReviewOutcome);
    setNextScheduledReview(pub.nextScheduledReview?.slice(0, 10) ?? nextScheduledReview);
    setEvidenceGrade(pub.evidenceGrade ?? evidenceGrade);
    setEditorialOpenAccess(pub.openAccess);
    setEditorialPeerReviewed(pub.physicianReviewed);
  };

  const closeReview = () => {
    setReviewPub(null);
  };

  const submitReview = async () => {
    if (!reviewPub) return;
    if ((reviewAction === "REJECT" || reviewAction === "REQUEST_REVISION") && !feedback.trim()) {
      showToast("Please provide feedback for the author");
      return;
    }
    try {
      await reviewMutation.mutateAsync({
        id: reviewPub.id,
        action: reviewAction,
        internalNotes: internalNotes.trim() || undefined,
        feedback: feedback.trim() || undefined,
        visibility: reviewAction === "APPROVE" ? visibility : undefined,
        featured: reviewAction === "APPROVE" ? featured : undefined,
        pinned: reviewAction === "APPROVE" ? pinned : undefined,
        reviewingPhysician: reviewAction === "APPROVE" ? reviewingPhysician.trim() || undefined : undefined,
        lastReviewedDate: reviewAction === "APPROVE" ? lastReviewedDate || undefined : undefined,
        peerReviewOutcome: reviewAction === "APPROVE" ? peerReviewOutcome || undefined : undefined,
        nextScheduledReview: reviewAction === "APPROVE" ? nextScheduledReview || undefined : undefined,
        evidenceGrade: reviewAction === "APPROVE" ? evidenceGrade.trim() || undefined : undefined,
        openAccess: reviewAction === "APPROVE" ? editorialOpenAccess : undefined,
        physicianReviewed: reviewAction === "APPROVE" ? editorialPeerReviewed : undefined,
      });
      const labels = {
        APPROVE: "Approved & published ✓",
        REJECT: "Publication rejected",
        REQUEST_REVISION: "Revision requested",
      };
      showToast(labels[reviewAction]);
      closeReview();
      setDetailPub(null);
    } catch {
      showToast("Review action failed");
    }
  };

  const tableRows = queueItems.map((pub) => [
    <strong key={`${pub.id}-title`}>{pub.title}</strong>,
    pub.doctor?.id ? (
      <Link key={`${pub.id}-doc`} href={adminDoctorProfileHref(pub.doctor.id)} className="cell-user-link">
        {doctorName(pub)}
      </Link>
    ) : (
      doctorName(pub)
    ),
    <StatusChip
      key={`${pub.id}-type`}
      label={PUBLICATION_TYPE_LABELS[pub.publicationType]}
      className="ch-p"
    />,
    pub.medicalSpecialty ?? pub.researchCategory ?? pub.doctor?.specialty ?? "—",
    pub.referenceCount ?? pub.references?.length ?? "—",
    reviewerName(pub),
    daysWaiting(pub),
    <StatusChip
      key={`${pub.id}-status`}
      label={PUBLICATION_STATUS_LABELS[pub.status]}
      className={statusChipClass(pub.status)}
    />,
    <div key={`${pub.id}-actions`} className="btn-row">
      <AdminButton onClick={() => openWorkspace(pub)}>Open</AdminButton>
      <AdminButton onClick={() => setDetailPub(pub)}>Preview Research</AdminButton>
      {publicationPdfUrl(pub) ? (
        <a href={publicationPdfUrl(pub)!} className="btn" target="_blank" rel="noopener noreferrer">
          Download PDF
        </a>
      ) : null}
      {!pub.assignedReviewer ? (
        <AdminButton onClick={() => setAssignPub(pub)}>Assign Reviewer</AdminButton>
      ) : null}
      {pub.status !== "APPROVED" ? (
        <>
          <AdminButton variant="green" onClick={() => openReview(pub, "APPROVE")}>
            Approve
          </AdminButton>
          <AdminButton variant="danger" onClick={() => openReview(pub, "REJECT")}>
            Reject
          </AdminButton>
          <AdminButton onClick={() => openReview(pub, "REQUEST_REVISION")}>
            Request Revision
          </AdminButton>
        </>
      ) : null}
      <AdminButton
        onClick={() =>
          flagsMutation.mutate(
            { id: pub.id, featured: !pub.featured },
            { onSuccess: () => showToast(pub.featured ? "Unfeatured" : "Featured publication") },
          )
        }
      >
        {pub.featured ? "Unfeature" : "Feature"}
      </AdminButton>
      <AdminButton
        onClick={() =>
          flagsMutation.mutate(
            { id: pub.id, pinned: !pub.pinned },
            { onSuccess: () => showToast(pub.pinned ? "Unpinned" : "Pinned publication") },
          )
        }
      >
        {pub.pinned ? "Unpin" : "Pin"}
      </AdminButton>
    </div>,
  ]);

  const recentRows = (recentQuery.data?.data ?? []).map((pub) => [
    pub.title,
    pub.doctor?.id ? (
      <Link key={`${pub.id}-doc`} href={adminDoctorProfileHref(pub.doctor.id)} className="cell-user-link">
        {doctorName(pub)}
      </Link>
    ) : (
      doctorName(pub)
    ),
    <StatusChip key={`${pub.id}-rtype`} label={PUBLICATION_TYPE_LABELS[pub.publicationType]} className="ch-p" />,
    pub.reviewingPhysician ?? pub.assignedReviewer ? `${pub.assignedReviewer?.firstName ?? ""} ${pub.assignedReviewer?.lastName ?? ""}`.trim() : "—",
    pub.publishedAt ? formatDate(pub.publishedAt) : "—",
  ]);

  const pagerInfo = meta
    ? `Showing ${queueItems.length} of ${meta.total} submissions`
    : "Loading publications...";

  return (
    <>
      <StatCardRow
        items={[
          {
            ic: "ic1",
            icon: "📤",
            num: statsQuery.isLoading ? "—" : formatNumber(statsQuery.data?.pending ?? 0),
            label: "Awaiting Review",
            tag: "Action needed",
            tagClass: "tt-a",
          },
          {
            ic: "ic2",
            icon: "⏱️",
            num: queueQuery.isLoading ? "—" : avgDays < 1 ? "<1" : avgDays.toFixed(1),
            label: "Avg Days in Queue",
            tag: "Target: 7 days",
            tagClass: "tt-g",
          },
          {
            ic: "ic3",
            icon: "🔄",
            num: revisionsQuery.isLoading ? "—" : formatNumber(revisionsCount),
            label: "Revisions Pending",
            tag: "From authors",
            tagClass: "tt-b",
          },
          {
            ic: "ic4",
            icon: "📚",
            num: statsQuery.isLoading ? "—" : formatNumber(statsQuery.data?.approved ?? 0),
            label: "Published (All Time)",
            tag: "On public page",
            tagClass: "tt-g",
          },
        ]}
      />

      <AdminPanel
        title="📤 Publications Awaiting Review"
        actions={
          <>
            <AdminButton onClick={() => showToast("Exporting queue as CSV...")}>⬇ Export</AdminButton>
            <Link href="/admin/review-process" className="btn">
              ⚙️ Review Settings
            </Link>
          </>
        }
        bodyClassName="panel-bd"
      >
        <FilterPills
          filters={[...STATUS_FILTERS]}
          activeIndex={statusFilterIndex}
          onChange={(index) => {
            setStatusFilterIndex(index);
            setPage(1);
          }}
        />
        <FilterPills
          filters={[...TYPE_FILTERS]}
          activeIndex={typeFilterIndex}
          onChange={(index) => {
            setTypeFilterIndex(index);
            setPage(1);
          }}
        />
        <AdminTable
          headers={[
            "Publication",
            "Author",
            "Type",
            "Focus Area",
            "Refs",
            "Assigned Reviewer",
            "Days Waiting",
            "Status",
            "Actions",
          ]}
          rows={tableRows}
          loading={queueQuery.isLoading}
          emptyMessage="No publications in review queue"
        />
        {meta && meta.totalPages > 1 ? (
          <AdminPagination
            info={pagerInfo}
            page={meta.page}
            totalPages={meta.totalPages}
            onPageChange={setPage}
          />
        ) : null}
      </AdminPanel>

      {workspacePub && workspacePreviewData ? (
        <AdminPanel
          title={`📄 Reviewing: ${workspacePub.title}`}
          actions={
            <div className="btn-row">
              <StatusChip label={PUBLICATION_STATUS_LABELS[workspacePub.status]} className={statusChipClass(workspacePub.status)} />
              <AdminButton variant="green" onClick={() => openReview(workspacePub, "APPROVE")}>
                ✓ Approve &amp; Publish
              </AdminButton>
              <AdminButton variant="danger" onClick={() => openReview(workspacePub, "REQUEST_REVISION")}>
                ↩ Request Revisions
              </AdminButton>
            </div>
          }
        >
          <div className="prw-grid">
            <div>
              <ResearchArticlePreview data={workspacePreviewData} />
            </div>
            <div className="prw-controls">
              <div className="panel" style={{ border: "1.5px solid var(--gray-200)", borderRadius: 16, overflow: "hidden" }}>
                <div className="panel-hd" style={{ padding: "14px 20px", borderBottom: "1px solid var(--gray-100)" }}>
                  <h3>🧑‍⚖️ Reviewer Controls</h3>
                </div>
                <div className="panel-bd" style={{ padding: 18 }}>
                  <div className="prw-note">
                    These editorial fields are set by the reviewer and appear on the published article — they are not part of the doctor&apos;s submission.
                  </div>
                  <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
                    <FormItem label="Reviewed by">
                      <input value={reviewingPhysician} onChange={(e) => setReviewingPhysician(e.target.value)} />
                    </FormItem>
                    <FormItem label="Last Reviewed date">
                      <input type="date" value={lastReviewedDate} onChange={(e) => setLastReviewedDate(e.target.value)} />
                    </FormItem>
                    <FormItem label="Peer Review Outcome">
                      <select value={peerReviewOutcome} onChange={(e) => setPeerReviewOutcome(e.target.value)}>
                        {PEER_REVIEW_OUTCOMES.map((outcome) => (
                          <option key={outcome} value={outcome}>
                            {outcome}
                          </option>
                        ))}
                      </select>
                    </FormItem>
                    <FormItem label="Next Scheduled Review">
                      <input type="date" value={nextScheduledReview} onChange={(e) => setNextScheduledReview(e.target.value)} />
                    </FormItem>
                    <FormItem label="Evidence Grade">
                      <input value={evidenceGrade} onChange={(e) => setEvidenceGrade(e.target.value)} placeholder="e.g. A1" />
                    </FormItem>
                  </div>
                  <div className="prw-check">
                    🔓 Open Access
                    <label className="switch">
                      <input type="checkbox" checked={editorialOpenAccess} onChange={(e) => setEditorialOpenAccess(e.target.checked)} />
                      <span className="slider" />
                    </label>
                  </div>
                  <div className="prw-check">
                    ✔ Peer-Reviewed
                    <label className="switch">
                      <input type="checkbox" checked={editorialPeerReviewed} onChange={(e) => setEditorialPeerReviewed(e.target.checked)} />
                      <span className="slider" />
                    </label>
                  </div>
                  <div className="btn-row" style={{ marginTop: 14 }}>
                    <AdminButton variant="green" onClick={() => openReview(workspacePub, "APPROVE")}>
                      ✓ Approve &amp; Publish
                    </AdminButton>
                    <AdminButton variant="danger" onClick={() => openReview(workspacePub, "REQUEST_REVISION")}>
                      ↩ Request Revisions
                    </AdminButton>
                  </div>
                  {publicationPdfUrl(workspacePub) ? (
                    <div style={{ marginTop: 12 }}>
                      <a
                        href={publicationPdfUrl(workspacePub)!}
                        className="btn"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "inline-flex" }}
                      >
                        ⬇ Download Attachments
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </AdminPanel>
      ) : null}

      <AdminPanel
        title="✅ Recently Published Publications"
        actions={<PanelLink href="/research-publications">View public page →</PanelLink>}
      >
        <AdminTable
          headers={["Publication", "Author", "Type", "Reviewed By", "Published"]}
          rows={recentRows}
          loading={recentQuery.isLoading}
          emptyMessage="No recently published publications"
        />
      </AdminPanel>

      {detailPub ? (
        <div className="modal-overlay" onClick={() => setDetailPub(null)}>
          <div className="modal" style={{ maxWidth: 900 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-hd">
              <h3>Publication Preview</h3>
              <button type="button" className="modal-close" onClick={() => setDetailPub(null)}>
                ✕
              </button>
            </div>
            <div className="modal-bd" style={{ maxHeight: "80vh", overflowY: "auto" }}>
              <ResearchArticlePreview data={publicationToPreviewData(detailPub)} />
            </div>
            <div className="modal-ft">
              <AdminButton onClick={() => setDetailPub(null)}>Close</AdminButton>
              {detailPub.status !== "APPROVED" ? (
                <>
                  <AdminButton variant="green" onClick={() => openReview(detailPub, "APPROVE")}>
                    Approve
                  </AdminButton>
                  <AdminButton variant="danger" onClick={() => openReview(detailPub, "REJECT")}>
                    Reject
                  </AdminButton>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {reviewPub ? (
        <div className="modal-overlay" onClick={closeReview}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-hd">
              <h3>
                {reviewAction === "APPROVE"
                  ? "Approve & Publish"
                  : reviewAction === "REJECT"
                    ? "Reject Publication"
                    : "Request Revision"}
              </h3>
              <button type="button" className="modal-close" onClick={closeReview}>
                ✕
              </button>
            </div>
            <div className="modal-bd">
              <p style={{ fontSize: "0.84rem", color: "var(--gray-600)", marginBottom: 4 }}>
                <strong>{reviewPub.title}</strong>
              </p>
              <FormGrid>
                <FormItem label="Internal Notes (admin only)" full>
                  <textarea
                    rows={3}
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Notes visible only to admins..."
                  />
                </FormItem>
                <FormItem label="Feedback to Author" full>
                  <textarea
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder={
                      reviewAction === "APPROVE"
                        ? "Optional approval message..."
                        : "Required — explain what needs to change..."
                    }
                  />
                </FormItem>
                {reviewAction === "APPROVE" ? (
                  <>
                    <FormItem label="Visibility">
                      <select value={visibility} onChange={(e) => setVisibility(e.target.value as PublicationVisibility)}>
                        <option value="PUBLIC">Public</option>
                        <option value="AFTER_APPROVAL">After Approval</option>
                        <option value="PRIVATE">Private</option>
                      </select>
                    </FormItem>
                    <FormItem label="Featured on public page">
                      <label className="switch" style={{ marginTop: 8 }}>
                        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
                        <span className="slider" />
                      </label>
                    </FormItem>
                    <FormItem label="Pinned in featured list">
                      <label className="switch" style={{ marginTop: 8 }}>
                        <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
                        <span className="slider" />
                      </label>
                    </FormItem>
                  </>
                ) : null}
              </FormGrid>
            </div>
            <div className="modal-ft">
              <AdminButton onClick={closeReview}>Cancel</AdminButton>
              <AdminButton
                variant={reviewAction === "REJECT" ? "danger" : reviewAction === "APPROVE" ? "green" : "primary"}
                onClick={submitReview}
              >
                {reviewAction === "APPROVE"
                  ? "Approve & Publish"
                  : reviewAction === "REJECT"
                    ? "Reject"
                    : "Send Revision Request"}
              </AdminButton>
            </div>
          </div>
        </div>
      ) : null}

      {assignPub ? (
        <AssignmentModal
          title={`Assign Reviewer — ${assignPub.title}`}
          reviewers={reviewersQuery.data ?? []}
          loading={reviewMutation.isPending}
          onClose={() => setAssignPub(null)}
          onAssign={(reviewerId) =>
            reviewMutation.mutate(
              {
                id: assignPub.id,
                action: "ASSIGN_REVIEWER",
                assignedReviewerId: reviewerId,
              },
              {
                onSuccess: () => {
                  showToast("Reviewer assigned");
                  setAssignPub(null);
                },
              },
            )
          }
        />
      ) : null}
    </>
  );
}
