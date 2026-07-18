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
  type BlogCategoryAdmin,
  useAdminCategoriesManage,
  useCreateBlogCategory,
  useDeleteBlogCategory,
  useUpdateBlogCategory,
} from "@/services/cms-api-hooks";

type CategoryForm = {
  name: string;
  slug: string;
  parentId: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
};

const EMPTY_FORM: CategoryForm = {
  name: "",
  slug: "",
  parentId: "",
  description: "",
  icon: "",
  color: "",
  isActive: true,
};

export function CategoriesPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BlogCategoryAdmin | null>(null);
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);

  const categoriesQuery = useAdminCategoriesManage({ page, limit: 15, search: search || undefined });
  const createMutation = useCreateBlogCategory();
  const updateMutation = useUpdateBlogCategory();
  const deleteMutation = useDeleteBlogCategory();

  const categories = categoriesQuery.data?.data ?? [];
  const meta = categoriesQuery.data?.meta;

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (cat: BlogCategoryAdmin) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId ?? "",
      description: cat.description ?? "",
      icon: cat.icon ?? "",
      color: cat.color ?? "",
      isActive: cat.isActive,
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
      showToast("Category name is required");
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugifyTitle(form.name),
      description: form.description.trim() || undefined,
      parentId: form.parentId || null,
      icon: form.icon.trim() || undefined,
      color: form.color.trim() || undefined,
      isActive: form.isActive,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, ...payload });
        showToast("Category updated ✓");
      } else {
        await createMutation.mutateAsync(payload);
        showToast("Category created ✓");
      }
      closeModal();
    } catch {
      showToast("Failed to save category");
    }
  };

  const handleDelete = async (cat: BlogCategoryAdmin) => {
    if (!window.confirm(`Delete category “${cat.name}”?`)) return;
    try {
      await deleteMutation.mutateAsync(cat.id);
      showToast("Category deleted");
    } catch {
      showToast("Cannot delete category — it may have articles or child categories");
    }
  };

  const rows = categories.map((cat) => [
    cat.name,
    `/${cat.slug}`,
    cat.parent?.name ?? "—",
    String(cat._count?.posts ?? 0),
    <StatusChip key={cat.id} label={cat.isActive ? "Active" : "Inactive"} className={cat.isActive ? "ch-g" : "ch-gray"} />,
    <div key={`${cat.id}-a`} className="btn-row">
      <AdminButton onClick={() => openEdit(cat)}>Edit</AdminButton>
      <AdminButton variant="danger" onClick={() => void handleDelete(cat)}>Delete</AdminButton>
    </div>,
  ]);

  return (
    <>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bd" style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="search"
            placeholder="Search categories..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput.trim()); setPage(1); } }}
            style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--gray-200)" }}
          />
          <AdminButton onClick={() => { setSearch(searchInput.trim()); setPage(1); }}>Search</AdminButton>
        </div>
      </div>

      <PanelTable
        title="🏷️ Blog Categories"
        actions={
          <AdminButton variant="primary" onClick={openCreate}>
            + New Category
          </AdminButton>
        }
        headers={["Category", "Slug", "Parent", "Articles", "Status", "Actions"]}
        rows={rows}
        loading={categoriesQuery.isLoading}
        pagerInfo={`Showing ${categories.length} of ${meta?.total ?? 0} categories`}
        page={page}
        totalPages={meta?.totalPages ?? 1}
        onPageChange={setPage}
        emptyMessage="No categories found"
      />

      {modalOpen ? (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hd">
              <h3>{editing ? "Edit Category" : "New Category"}</h3>
              <button type="button" className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-bd">
              <FormGrid>
                <FormItem label="Category Name *" full>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.slug || slugifyTitle(e.target.value) }))}
                    placeholder="e.g. Cardiovascular Health"
                  />
                </FormItem>
                <FormItem label="Slug">
                  <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="auto-generated-from-name" />
                </FormItem>
                <FormItem label="Parent Category">
                  <select value={form.parentId} onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}>
                    <option value="">None (top-level)</option>
                    {categories.filter((c) => c.id !== editing?.id).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </FormItem>
                <FormItem label="Description" full>
                  <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
                </FormItem>
                <FormItem label="Icon">
                  <input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="e.g. ❤️ or icon name" />
                </FormItem>
                <FormItem label="Color">
                  <input type="color" value={form.color || "#1a56a0"} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} />
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
                {editing ? "Save Changes" : "Create"}
              </AdminButton>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
