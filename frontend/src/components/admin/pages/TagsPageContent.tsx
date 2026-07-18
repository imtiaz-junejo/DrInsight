"use client";

import { useState } from "react";
import {
  AdminButton,
  FormGrid,
  FormItem,
  PanelTable,
  StatusChip,
  ToggleSwitch,
} from "@/components/admin/ui/AdminPrimitives";
import { slugifyTitle } from "@/lib/blog-toc";
import { useAdminUiStore } from "@/store/admin-ui.store";
import {
  type BlogTagAdmin,
  useAdminTagsManage,
  useCreateBlogTag,
  useDeleteBlogTag,
  useUpdateBlogTag,
} from "@/services/cms-api-hooks";

type TagForm = {
  name: string;
  slug: string;
  description: string;
  color: string;
  isActive: boolean;
};

const EMPTY_FORM: TagForm = {
  name: "",
  slug: "",
  description: "",
  color: "#1a56a0",
  isActive: true,
};

export function TagsPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BlogTagAdmin | null>(null);
  const [form, setForm] = useState<TagForm>(EMPTY_FORM);

  const tagsQuery = useAdminTagsManage({ page, limit: 20, search: search || undefined });
  const createMutation = useCreateBlogTag();
  const updateMutation = useUpdateBlogTag();
  const deleteMutation = useDeleteBlogTag();

  const tags = tagsQuery.data?.data ?? [];
  const meta = tagsQuery.data?.meta;

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (tag: BlogTagAdmin) => {
    setEditing(tag);
    setForm({
      name: tag.name,
      slug: tag.slug,
      description: tag.description ?? "",
      color: tag.color ?? "#1a56a0",
      isActive: tag.isActive,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast("Tag name is required");
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugifyTitle(form.name),
      description: form.description.trim() || undefined,
      color: form.color || undefined,
      isActive: form.isActive,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, ...payload });
        showToast("Tag updated ✓");
      } else {
        await createMutation.mutateAsync(payload);
        showToast("Tag created ✓");
      }
      closeModal();
    } catch {
      showToast("Failed to save tag — duplicate names are not allowed");
    }
  };

  const handleDelete = async (tag: BlogTagAdmin) => {
    if (!window.confirm(`Delete tag “${tag.name}”?`)) return;
    try {
      await deleteMutation.mutateAsync(tag.id);
      showToast("Tag deleted");
    } catch {
      showToast("Failed to delete tag");
    }
  };

  const rows = tags.map((tag) => [
    <span key={`${tag.id}-name`} style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {tag.color ? <span style={{ width: 12, height: 12, borderRadius: "50%", background: tag.color, flexShrink: 0 }} /> : null}
      {tag.name}
    </span>,
    `/${tag.slug}`,
    String(tag._count?.posts ?? 0),
    <StatusChip key={`${tag.id}-s`} label={tag.isActive ? "Active" : "Inactive"} className={tag.isActive ? "ch-g" : "ch-gray"} />,
    <div key={`${tag.id}-a`} className="btn-row">
      <AdminButton onClick={() => openEdit(tag)}>Edit</AdminButton>
      <AdminButton variant="danger" onClick={() => void handleDelete(tag)}>Delete</AdminButton>
    </div>,
  ]);

  return (
    <>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bd" style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="search"
            placeholder="Search tags..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput.trim()); setPage(1); } }}
            style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--gray-200)" }}
          />
          <AdminButton onClick={() => { setSearch(searchInput.trim()); setPage(1); }}>Search</AdminButton>
        </div>
      </div>

      <PanelTable
        title="#️⃣ All Tags"
        actions={
          <AdminButton variant="primary" onClick={openCreate}>
            + New Tag
          </AdminButton>
        }
        headers={["Tag", "Slug", "Articles", "Status", "Actions"]}
        rows={rows}
        loading={tagsQuery.isLoading}
        pagerInfo={`Showing ${tags.length} of ${meta?.total ?? 0} tags`}
        page={page}
        totalPages={meta?.totalPages ?? 1}
        onPageChange={setPage}
        emptyMessage="No tags found"
      />

      {modalOpen ? (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hd">
              <h3>{editing ? "Edit Tag" : "New Tag"}</h3>
              <button type="button" className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-bd">
              <FormGrid>
                <FormItem label="Tag Name *" full>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.slug || slugifyTitle(e.target.value) }))}
                    placeholder="e.g. hypertension"
                  />
                </FormItem>
                <FormItem label="Slug">
                  <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
                </FormItem>
                <FormItem label="Description" full>
                  <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
                </FormItem>
                <FormItem label="Color">
                  <input type="color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} />
                </FormItem>
                <FormItem label="Status">
                  <ToggleSwitch checked={form.isActive} onChange={(isActive) => setForm((f) => ({ ...f, isActive }))} />
                  <span style={{ marginLeft: 8, fontSize: "0.82rem" }}>{form.isActive ? "Active" : "Inactive"}</span>
                </FormItem>
              </FormGrid>
            </div>
            <div className="modal-ft">
              <AdminButton onClick={closeModal}>Cancel</AdminButton>
              <AdminButton variant="primary" onClick={() => void handleSave()}>
                Save
              </AdminButton>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
