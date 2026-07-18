"use client";

import { useState } from "react";
import { DocumentStatusBadge } from "@/components/admin/editorial/ReviewStatusBadge";
import { GuidelineEditorModal } from "@/components/admin/editorial/GuidelineEditorModal";
import {
  AdminButton,
  AdminPagination,
  AdminPanel,
  AdminTable,
  FilterPills,
} from "@/components/admin/ui/AdminPrimitives";
import { formatDate } from "@/lib/data-mappers";
import {
  GUIDELINE_CATEGORY_LABELS,
  useAddGuidelineAttachment,
  useArchiveAuthorGuideline,
  useAuthorGuideline,
  useAuthorGuidelines,
  useCreateAuthorGuideline,
  useDeleteAuthorGuideline,
  useDuplicateAuthorGuideline,
  usePublishAuthorGuideline,
  useUpdateAuthorGuideline,
  type AuthorGuideline,
  type AuthorGuidelineCategory,
  type EditorialDocumentStatus,
} from "@/services/editorial-api-hooks";
import { useAdminUiStore } from "@/store/admin-ui.store";

const STATUS_FILTERS = ["All", "Draft", "Published", "Archived"] as const;
const STATUS_MAP: Record<(typeof STATUS_FILTERS)[number], EditorialDocumentStatus | undefined> = {
  All: undefined,
  Draft: "DRAFT",
  Published: "PUBLISHED",
  Archived: "ARCHIVED",
};

const CATEGORY_FILTERS = ["All Categories", ...Object.values(GUIDELINE_CATEGORY_LABELS)] as const;

export function AuthorGuidelinesPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusIdx, setStatusIdx] = useState(0);
  const [categoryIdx, setCategoryIdx] = useState(0);
  const [editId, setEditId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const categoryFilter =
    categoryIdx === 0
      ? undefined
      : (Object.entries(GUIDELINE_CATEGORY_LABELS).find(([, l]) => l === CATEGORY_FILTERS[categoryIdx])?.[0] as AuthorGuidelineCategory);

  const listQuery = useAuthorGuidelines({
    page,
    limit: 20,
    search: search || undefined,
    status: STATUS_MAP[STATUS_FILTERS[statusIdx]],
    category: categoryFilter,
  });
  const detailQuery = useAuthorGuideline(editId ?? undefined);
  const createMutation = useCreateAuthorGuideline();
  const updateMutation = useUpdateAuthorGuideline();
  const publishMutation = usePublishAuthorGuideline();
  const archiveMutation = useArchiveAuthorGuideline();
  const duplicateMutation = useDuplicateAuthorGuideline();
  const deleteMutation = useDeleteAuthorGuideline();
  const attachMutation = useAddGuidelineAttachment();

  const guidelines = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta;

  const saveGuideline = async (data: Record<string, unknown>) => {
    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, ...data });
        showToast("Guideline updated — new version created");
      } else {
        await createMutation.mutateAsync(data);
        showToast("Guideline created");
      }
      setEditId(null);
      setCreating(false);
    } catch {
      showToast("Save failed");
    }
  };

  const rows = guidelines.map((g: AuthorGuideline) => [
    g.title,
    GUIDELINE_CATEGORY_LABELS[g.category],
    `v${g.version}`,
    <DocumentStatusBadge key={`${g.id}-st`} status={g.status} />,
    formatDate(g.updatedAt),
    <div key={`${g.id}-actions`} className="btn-row">
      <AdminButton onClick={() => setEditId(g.id)}>View</AdminButton>
      <AdminButton onClick={() => setEditId(g.id)}>Edit</AdminButton>
      <AdminButton
        onClick={() =>
          duplicateMutation.mutate(g.id, { onSuccess: () => showToast("Guideline duplicated") })
        }
      >
        Duplicate
      </AdminButton>
      {g.status !== "PUBLISHED" ? (
        <AdminButton
          variant="green"
          onClick={() =>
            publishMutation.mutate(g.id, { onSuccess: () => showToast("Guideline published") })
          }
        >
          Publish
        </AdminButton>
      ) : null}
      {g.status !== "ARCHIVED" ? (
        <AdminButton
          onClick={() =>
            archiveMutation.mutate(g.id, { onSuccess: () => showToast("Guideline archived") })
          }
        >
          Archive
        </AdminButton>
      ) : null}
      <AdminButton
        variant="danger"
        onClick={() =>
          deleteMutation.mutate(g.id, { onSuccess: () => showToast("Guideline deleted") })
        }
      >
        Delete
      </AdminButton>
    </div>,
  ]);

  return (
    <>
      <AdminPanel
        title="📘 Author Guidelines Management"
        actions={
          <>
            <AdminButton onClick={() => window.open("/author-guidelines", "_blank")}>
              👁 Preview Live Page
            </AdminButton>
            <AdminButton variant="primary" onClick={() => setCreating(true)}>
              + New Guideline
            </AdminButton>
          </>
        }
        bodyClassName="panel-bd"
      >
        <div className="search-bar">
          <input
            placeholder="Search guidelines..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setSearch(searchInput), setPage(1))}
          />
          <AdminButton onClick={() => (setSearch(searchInput), setPage(1))}>Search</AdminButton>
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
          filters={[...CATEGORY_FILTERS]}
          activeIndex={categoryIdx}
          onChange={(i) => {
            setCategoryIdx(i);
            setPage(1);
          }}
        />
        <AdminTable
          headers={["Title", "Category", "Version", "Status", "Updated Date", "Actions"]}
          rows={rows}
          loading={listQuery.isLoading}
          emptyMessage="No author guidelines yet — create your first guideline."
        />
        {meta && meta.totalPages > 1 ? (
          <AdminPagination
            info={`Showing ${guidelines.length} of ${meta.total} guidelines`}
            page={meta.page}
            totalPages={meta.totalPages}
            onPageChange={setPage}
          />
        ) : null}
      </AdminPanel>

      {(creating || editId) && !detailQuery.isLoading ? (
        <GuidelineEditorModal
          guideline={editId ? detailQuery.data : null}
          saving={createMutation.isPending || updateMutation.isPending}
          onClose={() => {
            setCreating(false);
            setEditId(null);
          }}
          onSave={saveGuideline}
          onAddAttachment={
            editId
              ? (file) =>
                  attachMutation.mutate(
                    { id: editId, ...file },
                    { onSuccess: () => showToast("Attachment added") },
                  )
              : undefined
          }
        />
      ) : null}
    </>
  );
}
