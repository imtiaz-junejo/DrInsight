"use client";

import { AdminButton, AdminPanel } from "@/components/admin/ui/AdminPrimitives";
import { useAdminUiStore } from "@/store/admin-ui.store";
import { useAdminBlogPosts } from "@/services/admin-api-hooks";

export function TagsPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const postsQuery = useAdminBlogPosts({ limit: 100 });

  const tagCounts = (postsQuery.data?.data ?? []).reduce<Record<string, number>>((acc, post) => {
    const tags = (post as { tags?: string[] }).tags ?? [];
    tags.forEach((tag) => {
      acc[tag] = (acc[tag] ?? 0) + 1;
    });
    return acc;
  }, {});

  const tags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  return (
    <AdminPanel
      title={`#️⃣ All Tags (${tags.length})`}
      actions={
        <AdminButton variant="primary" onClick={() => showToast("New tag created")}>
          + New Tag
        </AdminButton>
      }
      bodyClassName="panel-bd"
    >
      {postsQuery.isLoading ? (
        <p style={{ fontSize: "0.82rem", color: "var(--gray-400)" }}>Loading tags...</p>
      ) : tags.length === 0 ? (
        <p style={{ fontSize: "0.82rem", color: "var(--gray-400)" }}>No tags found in published articles</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {tags.map(([tag, count]) => (
            <span
              key={tag}
              className="chip ch-b"
              style={{ fontSize: "0.78rem", padding: "7px 14px", cursor: "pointer" }}
              onClick={() => showToast(`Editing tag: ${tag}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && showToast(`Editing tag: ${tag}`)}
            >
              {tag} <span style={{ opacity: 0.6 }}>({count})</span>
            </span>
          ))}
        </div>
      )}
    </AdminPanel>
  );
}
