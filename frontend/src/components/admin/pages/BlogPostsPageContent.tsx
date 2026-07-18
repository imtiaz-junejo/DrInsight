"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AdminButton,
  FilterPills,
  PanelTable,
  StatCardRow,
  StatusChip,
} from "@/components/admin/ui/AdminPrimitives";
import { adminBlogArticleHref, adminUserProfileHref } from "@/lib/admin-routes";
import { blogStatusChip, formatNumber } from "@/lib/admin-utils";
import { useAdminUiStore } from "@/store/admin-ui.store";
import {
  useAdminBlogCategories,
  useAdminBlogPosts,
  useDeleteBlogPost,
} from "@/services/admin-api-hooks";
import {
  useAdminBlogStats,
  useArchiveBlogPost,
  useDuplicateBlogPost,
  usePublishBlogPost,
  useUnpublishBlogPost,
} from "@/services/cms-api-hooks";

const STATUS_FILTERS = [
  { label: "All", value: undefined },
  { label: "Published", value: "PUBLISHED" },
  { label: "Drafts", value: "DRAFT" },
  { label: "Unpublished", value: "ARCHIVED" },
] as const;

const SORT_OPTIONS = [
  { label: "Recent", value: "recent" },
  { label: "Popular", value: "popular" },
  { label: "Title A–Z", value: "title" },
  { label: "Oldest", value: "oldest" },
] as const;

export function BlogPostsPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const [filterIndex, setFilterIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]["value"]>("recent");

  const status = STATUS_FILTERS[filterIndex]?.value;
  const postsQuery = useAdminBlogPosts({
    page,
    limit: 10,
    search: search || undefined,
    category: categoryFilter || undefined,
    authorId: authorFilter || undefined,
    status: status ?? "ALL",
    sort,
    ...(tagFilter ? { tag: tagFilter } : {}),
  });
  const categoriesQuery = useAdminBlogCategories();
  const statsQuery = useAdminBlogStats();
  const deletePost = useDeleteBlogPost();
  const publishPost = usePublishBlogPost();
  const unpublishPost = useUnpublishBlogPost();
  const archivePost = useArchiveBlogPost();
  const duplicatePost = useDuplicateBlogPost();

  const posts = postsQuery.data?.data ?? [];
  const meta = postsQuery.data?.meta;
  const stats = statsQuery.data;

  const authorOptions = useMemo(() => {
    const map = new Map<string, string>();
    posts.forEach((post) => {
      if (post.author?.id) {
        map.set(post.author.id, `Dr. ${post.author.firstName} ${post.author.lastName}`);
      }
    });
    return [...map.entries()];
  }, [posts]);

  const handleSearch = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  const runAction = async (label: string, action: () => Promise<unknown>) => {
    try {
      await action();
      showToast(`${label} ✓`);
    } catch {
      showToast(`Failed: ${label}`);
    }
  };

  const rows = posts.map((post) => {
    const postStatus = blogStatusChip((post as { status?: string }).status ?? "PUBLISHED");
    return [
      post.title,
      post.author?.id ? (
        <Link key={`${post.id}-author`} href={adminUserProfileHref(post.author.id)} className="cell-user-link">
          Dr. {post.author.firstName} {post.author.lastName}
        </Link>
      ) : (
        "—"
      ),
      post.category?.name ?? "—",
      post.reviewer ? `${post.reviewer.firstName} ${post.reviewer.lastName}` : "—",
      <StatusChip key={`${post.id}-s`} label={postStatus.label} className={postStatus.className} />,
      post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
      <div key={`${post.id}-a`} className="btn-row">
        <Link href={adminBlogArticleHref(post.slug)} className="btn">
          View
        </Link>
        <Link href={`/admin/submit-article?slug=${encodeURIComponent(post.slug)}`} className="btn">
          Edit
        </Link>
        <AdminButton
          onClick={() =>
            void runAction("Duplicated", () => duplicatePost.mutateAsync(post.slug))
          }
        >
          Duplicate
        </AdminButton>
        {(post as { status?: string }).status !== "PUBLISHED" ? (
          <AdminButton
            variant="green"
            onClick={() => void runAction("Published", () => publishPost.mutateAsync(post.slug))}
          >
            Publish
          </AdminButton>
        ) : (
          <AdminButton onClick={() => void runAction("Unpublished", () => unpublishPost.mutateAsync(post.slug))}>
            Unpublish
          </AdminButton>
        )}
        {(post as { status?: string }).status !== "ARCHIVED" ? (
          <AdminButton onClick={() => void runAction("Archived", () => archivePost.mutateAsync(post.slug))}>
            Archive
          </AdminButton>
        ) : null}
        <AdminButton
          variant="danger"
          onClick={() => {
            if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
            void runAction("Deleted", () => deletePost.mutateAsync(post.slug));
          }}
        >
          Delete
        </AdminButton>
      </div>,
    ];
  });

  return (
    <>
      <StatCardRow
        items={[
          {
            ic: "ic1",
            icon: "📰",
            num: formatNumber(stats?.total ?? meta?.total ?? 0),
            label: "Total Articles",
            tag: `${categoriesQuery.data?.length ?? 0} categories`,
            tagClass: "tt-b",
          },
          {
            ic: "ic2",
            icon: "✅",
            num: formatNumber(stats?.published ?? 0),
            label: "Published",
            tag: stats?.total ? `${Math.round(((stats.published ?? 0) / stats.total) * 100)}%` : "—",
            tagClass: "tt-g",
          },
          {
            ic: "ic3",
            icon: "📝",
            num: formatNumber(stats?.draft ?? 0),
            label: "Drafts",
            tag: "Awaiting review",
            tagClass: "tt-a",
          },
          {
            ic: "ic4",
            icon: "📦",
            num: formatNumber(stats?.archived ?? 0),
            label: "Archived",
            tag: "Unpublished",
            tagClass: "tt-gray",
          },
        ]}
      />

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bd" style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <input
            type="search"
            placeholder="Search articles..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            style={{ flex: "1 1 200px", minWidth: 180, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--gray-200)" }}
          />
          <AdminButton onClick={handleSearch}>Search</AdminButton>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--gray-200)" }}
          >
            <option value="">All categories</option>
            {(categoriesQuery.data ?? []).map((cat) => (
              <option key={cat.id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
          <select
            value={authorFilter}
            onChange={(e) => { setAuthorFilter(e.target.value); setPage(1); }}
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--gray-200)" }}
          >
            <option value="">All authors</option>
            {authorOptions.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Filter by tag"
            value={tagFilter}
            onChange={(e) => { setTagFilter(e.target.value); setPage(1); }}
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--gray-200)", width: 140 }}
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--gray-200)" }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>Sort: {opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <FilterPills
        filters={STATUS_FILTERS.map((f) => f.label)}
        activeIndex={filterIndex}
        onChange={(index) => { setFilterIndex(index); setPage(1); }}
      />

      <PanelTable
        title="All Articles"
        actions={
          <Link href="/admin/submit-article" className="btn btn-primary">
            + New Article
          </Link>
        }
        headers={["Title", "Author", "Category", "Reviewer", "Status", "Published", "Actions"]}
        rows={rows}
        loading={postsQuery.isLoading}
        pagerInfo={`Showing ${rows.length} of ${meta?.total ?? 0} articles`}
        page={page}
        totalPages={meta?.totalPages ?? 1}
        onPageChange={setPage}
        emptyMessage="No blog posts found"
      />
    </>
  );
}
