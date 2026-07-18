"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ResearchArticlePreview,
  publicationToPreviewData,
} from "@/components/publications/PublicationPreview";
import {
  DashButton,
  DashCard,
  DashPageHeader,
  FilterPills,
  StatCardRow,
  TableButton,
} from "@/components/doctor/ui/DoctorPrimitives";
import { formatDate } from "@/lib/data-mappers";
import { todayFormatted } from "@/lib/doctor-utils";
import {
  PUBLICATION_STATUS_LABELS,
  PUBLICATION_TYPE_LABELS,
  type Publication,
  type PublicationStatus,
  publicationAuthorsLine,
  useDeletePublication,
  useDoctorPublicationStats,
  useDoctorPublications,
  useDuplicatePublication,
} from "@/services/publications-api-hooks";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

const STATUS_FILTERS: Array<{ label: string; value?: PublicationStatus }> = [
  { label: "All" },
  { label: "Draft", value: "DRAFT" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Needs Revision", value: "NEEDS_REVISION" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "views", label: "Most views" },
  { value: "downloads", label: "Most downloads" },
  { value: "citations", label: "Most citations" },
] as const;

function publicationStatusMeta(status: PublicationStatus): { statusClass: string; statusLabel: string } {
  if (status === "APPROVED") return { statusClass: "as-live", statusLabel: "Published" };
  if (status === "DRAFT") return { statusClass: "as-draft", statusLabel: "Draft" };
  if (status === "REJECTED") return { statusClass: "as-reject", statusLabel: "Rejected" };
  if (status === "NEEDS_REVISION") return { statusClass: "as-revision", statusLabel: "Needs Revision" };
  return { statusClass: "as-review", statusLabel: PUBLICATION_STATUS_LABELS[status] };
}

function publicationToPreview(pub: Publication) {
  return publicationToPreviewData(pub);
}

export function PublicationsPageContent() {
  const router = useRouter();
  const showToast = useDoctorUiStore((s) => s.showToast);
  const [filterIndex, setFilterIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]["value"]>("newest");
  const [previewPublication, setPreviewPublication] = useState<Publication | null>(null);

  const statusFilter = STATUS_FILTERS[filterIndex]?.value;
  const publicationsQuery = useDoctorPublications({
    page,
    limit: 10,
    search: search.trim() || undefined,
    status: statusFilter,
    sort,
  });
  const statsQuery = useDoctorPublicationStats();
  const deletePublication = useDeletePublication();
  const duplicatePublication = useDuplicatePublication();

  const publications = publicationsQuery.data?.data ?? [];
  const meta = publicationsQuery.data?.meta;
  const stats = statsQuery.data;

  const filterLabels = useMemo(
    () =>
      STATUS_FILTERS.map((filter) => {
        if (!stats || filter.value == null) return filter.label;
        const countMap: Partial<Record<PublicationStatus, number>> = {
          DRAFT: stats.drafts,
          APPROVED: stats.approved,
          REJECTED: stats.rejected,
          SUBMITTED: stats.pending,
          UNDER_REVIEW: stats.pending,
          NEEDS_REVISION: stats.pending,
        };
        const count = filter.value ? countMap[filter.value] : stats.total;
        return count != null ? `${filter.label} (${count})` : filter.label;
      }),
    [stats],
  );

  const statCards = useMemo(
    () => [
      {
        ic: "ic1",
        icon: "📚",
        num: String(stats?.total ?? 0),
        label: "Total Publications",
        tag: "All submissions",
        tagClass: "tt-b",
        bgIcon: "📚",
      },
      {
        ic: "ic2",
        icon: "✅",
        num: String(stats?.approved ?? 0),
        label: "Published",
        tag: "Approved & live",
        tagClass: "tt-g",
        bgIcon: "✅",
      },
      {
        ic: "ic3",
        icon: "🔬",
        num: String(stats?.pending ?? 0),
        label: "In Review",
        tag: "Awaiting decision",
        tagClass: "tt-a",
        bgIcon: "🔬",
      },
      {
        ic: "ic4",
        icon: "📝",
        num: String(stats?.drafts ?? 0),
        label: "Drafts",
        tag: `${stats?.rejected ?? 0} rejected`,
        tagClass: "tt-gray",
        bgIcon: "📝",
      },
    ],
    [stats],
  );

  const handleDelete = async (publication: Publication) => {
    if (publication.status !== "DRAFT") {
      showToast("⚠️ Only drafts can be deleted");
      return;
    }
    if (!window.confirm(`Delete draft "${publication.title}"?`)) return;
    try {
      await deletePublication.mutateAsync(publication.id);
      showToast("✓ Draft deleted");
    } catch {
      showToast("⚠️ Failed to delete publication");
    }
  };

  const handleDuplicate = async (publication: Publication) => {
    try {
      const duplicated = await duplicatePublication.mutateAsync(publication.id);
      showToast("✓ Publication duplicated as draft");
      window.location.href = `/doctor/submit-publication?id=${duplicated.id}`;
    } catch {
      showToast("⚠️ Failed to duplicate publication");
    }
  };

  return (
    <>
      <DashPageHeader
        subtitle="👨‍⚕️ Physician Dashboard"
        title="My Publications"
        dateStr={todayFormatted()}
        actions={
          <Link href="/doctor/submit-publication">
            <DashButton variant="solid">+ Submit Publication</DashButton>
          </Link>
        }
      />

      <StatCardRow items={statCards} />

      <DashCard
        title="📚 Research & Publications"
        headerExtra={
          <span style={{ fontSize: "0.76rem", color: "var(--gray-400)" }}>
            {publicationsQuery.isLoading ? "Loading..." : `${meta?.total ?? 0} total`}
          </span>
        }
      >
        <div className="search-bar">
          <div className="search-ico-w">
            <input
              className="search-inp"
              placeholder="Search by title, journal, or keyword..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
          <FilterPills
            filters={filterLabels}
            activeIndex={filterIndex}
            onChange={(index) => {
              setFilterIndex(index);
              setPage(1);
            }}
          />
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as (typeof SORT_OPTIONS)[number]["value"]);
              setPage(1);
            }}
            style={{
              marginLeft: "auto",
              padding: "8px 12px",
              border: "1.5px solid var(--gray-200)",
              borderRadius: 8,
              fontSize: "0.8rem",
              fontFamily: "var(--font-body)",
              color: "var(--gray-700)",
            }}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="pt-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Specialty</th>
                <th>Updated</th>
                <th>Views</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {publicationsQuery.isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}>
                    Loading...
                  </td>
                </tr>
              ) : publications.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}>
                    No publications yet
                  </td>
                </tr>
              ) : (
                publications.map((publication) => {
                  const { statusClass, statusLabel } = publicationStatusMeta(publication.status);
                  const updated = publication.updatedAt ? formatDate(publication.updatedAt) : "—";

                  return (
                    <tr key={publication.id}>
                      <td style={{ fontWeight: 600, fontSize: "0.84rem", maxWidth: 240 }}>
                        <div>{publication.title}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--gray-400)", fontWeight: 500, marginTop: 2 }}>
                          {publicationAuthorsLine(publication)}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            padding: "2px 9px",
                            borderRadius: 50,
                            background: "var(--blue-light)",
                            color: "var(--blue)",
                          }}
                        >
                          {PUBLICATION_TYPE_LABELS[publication.publicationType]}
                        </span>
                      </td>
                      <td>{publication.medicalSpecialty ?? "—"}</td>
                      <td>{updated}</td>
                      <td>{publication.viewCount.toLocaleString()}</td>
                      <td>
                        <span className={`art-status ${statusClass}`}>{statusLabel}</span>
                      </td>
                      <td>
                        <TableButton onClick={() => router.push(`/doctor/submit-publication?id=${publication.id}`)}>
                          Edit
                        </TableButton>
                        <TableButton variant="view" onClick={() => setPreviewPublication(publication)}>
                          Preview
                        </TableButton>
                        {publication.status === "APPROVED" ? (
                          <TableButton
                            variant="view"
                            onClick={() => window.open(`/research-publications/${publication.slug}`, "_blank")}
                          >
                            View Live
                          </TableButton>
                        ) : null}
                        <TableButton onClick={() => handleDuplicate(publication)}>Duplicate</TableButton>
                        {publication.status === "DRAFT" ? (
                          <TableButton onClick={() => handleDelete(publication)}>Delete</TableButton>
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 ? (
          <div className="pay-pagination" style={{ marginTop: 16 }}>
            <DashButton variant="outline" onClick={() => page > 1 && setPage((current) => current - 1)}>
              Previous
            </DashButton>
            <span>
              Page {meta.page} of {meta.totalPages}
            </span>
            <DashButton
              variant="outline"
              onClick={() => page < meta.totalPages && setPage((current) => current + 1)}
            >
              Next
            </DashButton>
          </div>
        ) : null}
      </DashCard>

      {previewPublication ? (
        <div
          className="modal-ov show"
          onClick={(event) => {
            if (event.target === event.currentTarget) setPreviewPublication(null);
          }}
        >
          <div className="modal" style={{ maxWidth: 720 }}>
            <div className="modal-hd">
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>
                  {previewPublication.title}
                </h3>
                <p style={{ fontSize: "0.78rem", color: "var(--gray-400)", marginTop: 4 }}>
                  Publication preview
                </p>
              </div>
              <button type="button" className="modal-close" onClick={() => setPreviewPublication(null)}>
                ✕
              </button>
            </div>
            <div className="modal-bd">
              <ResearchArticlePreview data={publicationToPreview(previewPublication)} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
