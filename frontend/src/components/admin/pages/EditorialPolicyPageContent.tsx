"use client";

import { useState } from "react";
import { DocumentStatusBadge } from "@/components/admin/editorial/ReviewStatusBadge";
import { PolicyEditorModal } from "@/components/admin/editorial/PolicyEditorModal";
import {
  AdminButton,
  AdminPagination,
  AdminPanel,
  AdminTable,
  FilterPills,
} from "@/components/admin/ui/AdminPrimitives";
import { formatDate } from "@/lib/data-mappers";
import {
  POLICY_CATEGORY_LABELS,
  useArchiveEditorialPolicy,
  useCreateEditorialPolicy,
  useDeleteEditorialPolicy,
  useDuplicateEditorialPolicy,
  useEditorialPolicies,
  useEditorialPolicy,
  usePublishEditorialPolicy,
  useUpdateEditorialPolicy,
  type EditorialDocumentStatus,
  type EditorialPolicy,
  type EditorialPolicyCategory,
} from "@/services/editorial-api-hooks";
import { useAdminUiStore } from "@/store/admin-ui.store";

const STATUS_FILTERS = ["All", "Draft", "Published", "Archived"] as const;
const STATUS_MAP: Record<(typeof STATUS_FILTERS)[number], EditorialDocumentStatus | undefined> = {
  All: undefined,
  Draft: "DRAFT",
  Published: "PUBLISHED",
  Archived: "ARCHIVED",
};

const CATEGORY_FILTERS = ["All Categories", ...Object.values(POLICY_CATEGORY_LABELS)] as const;

export function EditorialPolicyPageContent() {
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
      : (Object.entries(POLICY_CATEGORY_LABELS).find(([, l]) => l === CATEGORY_FILTERS[categoryIdx])?.[0] as EditorialPolicyCategory);

  const listQuery = useEditorialPolicies({
    page,
    limit: 20,
    search: search || undefined,
    status: STATUS_MAP[STATUS_FILTERS[statusIdx]],
    category: categoryFilter,
  });
  const detailQuery = useEditorialPolicy(editId ?? undefined);
  const createMutation = useCreateEditorialPolicy();
  const updateMutation = useUpdateEditorialPolicy();
  const publishMutation = usePublishEditorialPolicy();
  const archiveMutation = useArchiveEditorialPolicy();
  const duplicateMutation = useDuplicateEditorialPolicy();
  const deleteMutation = useDeleteEditorialPolicy();

  const policies = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta;

  const savePolicy = async (data: Record<string, unknown>) => {
    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, ...data });
        showToast("Policy updated — new version created");
      } else {
        await createMutation.mutateAsync(data);
        showToast("Policy created");
      }
      setEditId(null);
      setCreating(false);
    } catch {
      showToast("Save failed");
    }
  };

  const rows = policies.map((p: EditorialPolicy) => [
    p.title,
    POLICY_CATEGORY_LABELS[p.category],
    `v${p.version}`,
    p.effectiveDate ? formatDate(p.effectiveDate) : "—",
    <DocumentStatusBadge key={`${p.id}-st`} status={p.status} />,
    formatDate(p.updatedAt),
    <div key={`${p.id}-actions`} className="btn-row">
      <AdminButton onClick={() => setEditId(p.id)}>View</AdminButton>
      <AdminButton onClick={() => setEditId(p.id)}>Edit</AdminButton>
      <AdminButton
        onClick={() =>
          duplicateMutation.mutate(p.id, { onSuccess: () => showToast("Policy duplicated") })
        }
      >
        Duplicate
      </AdminButton>
      {p.status !== "ARCHIVED" ? (
        <AdminButton
          onClick={() =>
            archiveMutation.mutate(p.id, { onSuccess: () => showToast("Policy archived") })
          }
        >
          Archive
        </AdminButton>
      ) : null}
      {p.status !== "PUBLISHED" ? (
        <AdminButton
          variant="green"
          onClick={() =>
            publishMutation.mutate(p.id, { onSuccess: () => showToast("Policy published") })
          }
        >
          Publish
        </AdminButton>
      ) : null}
      <AdminButton
        variant="danger"
        onClick={() =>
          deleteMutation.mutate(p.id, { onSuccess: () => showToast("Policy deleted") })
        }
      >
        Delete
      </AdminButton>
    </div>,
  ]);

  return (
    <>
      <AdminPanel
        title="📜 Editorial Policy Management"
        actions={
          <>
            <AdminButton onClick={() => window.open("/editorial-policy", "_blank")}>
              👁 Preview Live Page
            </AdminButton>
            <AdminButton variant="primary" onClick={() => setCreating(true)}>
              + New Policy
            </AdminButton>
          </>
        }
        bodyClassName="panel-bd"
      >
        <div className="search-bar">
          <input
            placeholder="Search policies..."
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
          headers={["Title", "Category", "Version", "Effective Date", "Status", "Last Updated", "Actions"]}
          rows={rows}
          loading={listQuery.isLoading}
          emptyMessage="No editorial policies yet — create your first policy."
        />
        {meta && meta.totalPages > 1 ? (
          <AdminPagination
            info={`Showing ${policies.length} of ${meta.total} policies`}
            page={meta.page}
            totalPages={meta.totalPages}
            onPageChange={setPage}
          />
        ) : null}
      </AdminPanel>

      {(creating || editId) && !detailQuery.isLoading ? (
        <PolicyEditorModal
          policy={editId ? detailQuery.data : null}
          saving={createMutation.isPending || updateMutation.isPending}
          onClose={() => {
            setCreating(false);
            setEditId(null);
          }}
          onSave={savePolicy}
        />
      ) : null}
    </>
  );
}
