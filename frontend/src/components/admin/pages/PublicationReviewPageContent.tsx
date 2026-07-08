"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
import { formatNumber } from "@/lib/admin-utils";
import { formatDate, formatRelativeTime } from "@/lib/data-mappers";
import {
  type Publication,
  type PublicationStatus,
  type PublicationType,
  type PublicationVisibility,
  PUBLICATION_STATUS_LABELS,
  PUBLICATION_TYPE_LABELS,
  publicationAuthorsLine,
  publicationCoverUrl,
  publicationPdfUrl,
  useAdminPublicationStats,
  useAdminPublications,
  useReviewPublication,
} from "@/services/publications-api-hooks";
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

const TYPE_FILTERS = ["All Types", ...Object.values(PUBLICATION_TYPE_LABELS)] as const;

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

function avgQueueDays(pubs: Publication[]): number {
  const dated = pubs.filter((p) => p.submittedAt);
  if (!dated.length) return 0;
  const totalMs = dated.reduce((sum, p) => sum + Date.now() - new Date(p.submittedAt!).getTime(), 0);
  return totalMs / dated.length / (1000 * 60 * 60 * 24);
}

function detailValue(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="fg-item full">
      <label>{label}</label>
      <div style={{ fontSize: "0.86rem", color: "var(--gray-700)", lineHeight: 1.6 }}>{value}</div>
    </div>
  );
}

export function PublicationReviewPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const [page, setPage] = useState(1);
  const [statusFilterIndex, setStatusFilterIndex] = useState(0);
  const [typeFilterIndex, setTypeFilterIndex] = useState(0);
  const [detailPub, setDetailPub] = useState<Publication | null>(null);
  const [reviewPub, setReviewPub] = useState<Publication | null>(null);
  const [reviewAction, setReviewAction] = useState<"APPROVE" | "REJECT" | "REQUEST_REVISION">("APPROVE");
  const [internalNotes, setInternalNotes] = useState("");
  const [feedback, setFeedback] = useState("");
  const [visibility, setVisibility] = useState<PublicationVisibility>("PUBLIC");
  const [featured, setFeatured] = useState(false);
  const [pinned, setPinned] = useState(false);

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

  const openReview = (pub: Publication, action: "APPROVE" | "REJECT" | "REQUEST_REVISION") => {
    setReviewPub(pub);
    setReviewAction(action);
    setInternalNotes("");
    setFeedback("");
    setVisibility(pub.visibility ?? "PUBLIC");
    setFeatured(pub.featured);
    setPinned(pub.pinned);
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
    doctorName(pub),
    pub.medicalSpecialty ?? pub.doctor?.specialty ?? "—",
    <StatusChip
      key={`${pub.id}-type`}
      label={PUBLICATION_TYPE_LABELS[pub.publicationType]}
      className="ch-p"
    />,
    pub.submittedAt ? formatRelativeTime(pub.submittedAt) : formatDate(pub.createdAt),
    <StatusChip
      key={`${pub.id}-status`}
      label={PUBLICATION_STATUS_LABELS[pub.status]}
      className={statusChipClass(pub.status)}
    />,
    <div key={`${pub.id}-actions`} className="btn-row">
      <AdminButton onClick={() => setDetailPub(pub)}>View</AdminButton>
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
    </div>,
  ]);

  const recentRows = (recentQuery.data?.data ?? []).map((pub) => [
    pub.title,
    doctorName(pub),
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
          headers={["Title", "Doctor", "Specialty", "Publication Type", "Submitted Date", "Status", "Actions"]}
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
          <div className="modal" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-hd">
              <h3>Publication Details</h3>
              <button type="button" className="modal-close" onClick={() => setDetailPub(null)}>
                ✕
              </button>
            </div>
            <div className="modal-bd" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {publicationCoverUrl(detailPub) ? (
                <img
                  src={publicationCoverUrl(detailPub)!}
                  alt=""
                  style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 10, marginBottom: 12 }}
                />
              ) : null}
              <FormGrid>
                <DetailRow label="Title" value={detailPub.title} />
                <DetailRow label="Subtitle" value={detailValue(detailPub.subtitle)} />
                <DetailRow label="Abstract" value={detailPub.abstract} />
                <DetailRow label="Doctor" value={doctorName(detailPub)} />
                <DetailRow label="Specialty" value={detailValue(detailPub.medicalSpecialty ?? detailPub.doctor?.specialty)} />
                <DetailRow label="Publication Type" value={PUBLICATION_TYPE_LABELS[detailPub.publicationType]} />
                <DetailRow label="Status" value={PUBLICATION_STATUS_LABELS[detailPub.status]} />
                <DetailRow label="Authors" value={publicationAuthorsLine(detailPub)} />
                <DetailRow label="Journal" value={detailValue(detailPub.journalName)} />
                <DetailRow label="DOI" value={detailValue(detailPub.doi)} />
                <DetailRow label="Institution" value={detailValue(detailPub.institution)} />
                <DetailRow label="Department" value={detailValue(detailPub.department)} />
                <DetailRow label="Research Category" value={detailValue(detailPub.researchCategory)} />
                <DetailRow label="Methodology" value={detailValue(detailPub.researchMethodology)} />
                <DetailRow label="Study Design" value={detailValue(detailPub.studyDesign)} />
                <DetailRow label="Sample Size" value={detailValue(detailPub.sampleSize)} />
                <DetailRow label="Funding Source" value={detailValue(detailPub.fundingSource)} />
                <DetailRow label="Ethical Approval" value={detailValue(detailPub.ethicalApprovalNumber)} />
                <DetailRow label="Clinical Trial Reg." value={detailValue(detailPub.clinicalTrialRegistration)} />
                <DetailRow label="References" value={detailValue(detailPub.referenceCount)} />
                <DetailRow label="Keywords" value={detailPub.keywords?.map((k) => k.keyword).join(", ") || "—"} />
                <DetailRow label="Visibility" value={detailPub.visibility} />
                <DetailRow label="Physician Reviewed" value={detailValue(detailPub.physicianReviewed)} />
                <DetailRow label="Evidence Based" value={detailValue(detailPub.evidenceBased)} />
                <DetailRow label="Open Access" value={detailValue(detailPub.openAccess)} />
                <DetailRow label="Submitted" value={detailPub.submittedAt ? formatDate(detailPub.submittedAt) : "—"} />
                <DetailRow label="PDF" value={publicationPdfUrl(detailPub) ? "Attached" : "—"} />
              </FormGrid>
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
    </>
  );
}
