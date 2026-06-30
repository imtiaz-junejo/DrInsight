"use client";

import {
  AdminButton,
  PanelTable,
  StatusChip,
} from "@/components/admin/ui/AdminPrimitives";
import { useAdminUiStore } from "@/store/admin-ui.store";
import { useAdminBlogCategories, useAdminBlogPosts } from "@/services/admin-api-hooks";

export function CategoriesPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const categoriesQuery = useAdminBlogCategories();
  const postsQuery = useAdminBlogPosts({ limit: 100 });

  const postCounts = (postsQuery.data?.data ?? []).reduce<Record<string, number>>((acc, post) => {
    const slug = post.category?.slug;
    if (slug) acc[slug] = (acc[slug] ?? 0) + 1;
    return acc;
  }, {});

  const rows = (categoriesQuery.data ?? []).map((cat) => [
    cat.name,
    `/${cat.slug}`,
    String(postCounts[cat.slug] ?? 0),
    <StatusChip key={cat.id} label="Active" className="ch-g" />,
    <div key={`${cat.id}-a`} className="btn-row">
      <AdminButton onClick={() => showToast("Opening editor...")}>Edit</AdminButton>
    </div>,
  ]);

  return (
    <PanelTable
      title="🏷️ Blog Categories"
      actions={
        <AdminButton variant="primary" onClick={() => showToast("New category created")}>
          + New Category
        </AdminButton>
      }
      headers={["Category", "Slug", "Articles", "Status", "Actions"]}
      rows={rows}
      loading={categoriesQuery.isLoading}
      emptyMessage="No categories found"
    />
  );
}
