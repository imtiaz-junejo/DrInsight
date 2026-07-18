"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AdminButton,
  AdminPanel,
  GridTwo,
  StatusChip,
  UserCell,
} from "@/components/admin/ui/AdminPrimitives";
import { adminDoctorArticlesHref, adminUserProfileHref } from "@/lib/admin-routes";
import { blogStatusChip, formatDateTime, formatNumber } from "@/lib/admin-utils";
import { useAdminBlogPost, useDeleteBlogPost } from "@/services/admin-api-hooks";
import { useAdminUiStore } from "@/store/admin-ui.store";
import { useRouter } from "next/navigation";

export function BlogArticleDetailPageContent({ slug }: { slug: string }) {
  const router = useRouter();
  const showToast = useAdminUiStore((s) => s.showToast);
  const postQuery = useAdminBlogPost(slug);
  const deletePost = useDeleteBlogPost();
  const post = postQuery.data;

  if (postQuery.isLoading) {
    return <AdminPanel title="Loading article...">Fetching article from database...</AdminPanel>;
  }

  if (postQuery.isError || !post) {
    return (
      <AdminPanel title="Article not found">
        <Link href="/admin/blog-posts" className="detail-back">
          ← Back to Blog Posts
        </Link>
      </AdminPanel>
    );
  }

  const status = blogStatusChip(post.status);
  const authorId = post.author?.id;

  return (
    <>
      {authorId ? (
        <Link href={adminDoctorArticlesHref(authorId)} className="detail-back">
          ← Back to doctor articles
        </Link>
      ) : (
        <Link href="/admin/blog-posts" className="detail-back">
          ← Back to Blog Posts
        </Link>
      )}

      <div className="profile-hero">
        <div style={{ flex: 1 }}>
          <h2>{post.title}</h2>
          <div className="profile-meta">
            <StatusChip label={status.label} className={status.className} />
            {post.peerReviewed ? <StatusChip label="Peer reviewed" className="ch-g" /> : null}
            <StatusChip label={post.category?.name ?? "Uncategorized"} className="ch-b" />
          </div>
          <div className="btn-row" style={{ marginTop: 14 }}>
            <Link href={`/blog/${post.slug}`} className="btn" target="_blank">
              Open public page
            </Link>
            <AdminButton
              variant="danger"
              onClick={() => {
                if (!window.confirm(`Delete "${post.title}"?`)) return;
                deletePost.mutate(post.slug, {
                  onSuccess: () => {
                    showToast("Article deleted");
                    router.push(authorId ? adminDoctorArticlesHref(authorId) : "/admin/blog-posts");
                  },
                  onError: () => showToast("Delete failed"),
                });
              }}
            >
              Delete
            </AdminButton>
          </div>
        </div>
      </div>

      {post.coverImageUrl ? (
        <Image
          src={post.coverImageUrl}
          alt={post.title}
          width={1200}
          height={400}
          className="article-cover-lg"
          unoptimized
        />
      ) : null}

      <div className="kv-grid" style={{ marginBottom: 18 }}>
        <div className="kv-card">
          <strong>{formatNumber(post.viewCount)}</strong>
          <span>Views</span>
        </div>
        <div className="kv-card">
          <strong>{formatNumber(post.downloadCount ?? post.shareCount)}</strong>
          <span>Shares</span>
        </div>
        <div className="kv-card">
          <strong>{formatNumber(post.bookmarkCount ?? post.helpfulYes)}</strong>
          <span>Helpful votes</span>
        </div>
        <div className="kv-card">
          <strong>{formatNumber(post.citationCount ?? 0)}</strong>
          <span>Citations</span>
        </div>
        <div className="kv-card">
          <strong>{formatNumber(post._count?.comments ?? 0)}</strong>
          <span>Comments</span>
        </div>
        <div className="kv-card">
          <strong>{formatNumber(post._count?.ratings ?? 0)}</strong>
          <span>Ratings</span>
        </div>
      </div>

      <GridTwo>
        <AdminPanel title="Article Details">
          <dl className="detail-list">
            <div className="detail-row">
              <dt>Slug</dt>
              <dd>{post.slug}</dd>
            </div>
            <div className="detail-row">
              <dt>Specialty</dt>
              <dd>{post.specialty ?? post.author?.doctorProfile?.specialty ?? "—"}</dd>
            </div>
            <div className="detail-row">
              <dt>Published</dt>
              <dd>{post.publishedAt ? formatDateTime(post.publishedAt) : "—"}</dd>
            </div>
            <div className="detail-row">
              <dt>Created</dt>
              <dd>{formatDateTime(post.createdAt)}</dd>
            </div>
            <div className="detail-row">
              <dt>Updated</dt>
              <dd>{formatDateTime(post.updatedAt)}</dd>
            </div>
            <div className="detail-row">
              <dt>Reviewer</dt>
              <dd>
                {post.reviewer
                  ? `${post.reviewer.firstName} ${post.reviewer.lastName}`
                  : "—"}
              </dd>
            </div>
            <div className="detail-row">
              <dt>Excerpt</dt>
              <dd>{post.excerpt}</dd>
            </div>
          </dl>
        </AdminPanel>

        <AdminPanel title="Author">
          {post.author ? (
            <>
              <UserCell
                firstName={post.author.firstName}
                lastName={post.author.lastName}
                userId={post.author.id}
                seed={post.author.id}
                sub={post.author.doctorProfile?.specialty}
              />
              <Link
                href={adminUserProfileHref(post.author.id)}
                className="btn"
                style={{ marginTop: 12 }}
              >
                View author profile
              </Link>
            </>
          ) : (
            "—"
          )}
        </AdminPanel>
      </GridTwo>

      <AdminPanel title="Article Content">
        <div
          className="article-content-preview"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </AdminPanel>
    </>
  );
}
