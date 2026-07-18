"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  AdminButton,
  PanelTable,
  StatusChip,
  UserAvatar,
} from "@/components/admin/ui/AdminPrimitives";
import { adminBlogArticleHref, adminUserProfileHref } from "@/lib/admin-routes";
import { blogStatusChip, formatDateTime, formatNumber } from "@/lib/admin-utils";
import {
  useAdminBlogPosts,
  useAdminUserProfile,
  useDeleteBlogPost,
} from "@/services/admin-api-hooks";
import { useAdminUiStore } from "@/store/admin-ui.store";

export function DoctorArticlesPageContent({ userId }: { userId: string }) {
  const showToast = useAdminUiStore((s) => s.showToast);
  const [page, setPage] = useState(1);
  const profileQuery = useAdminUserProfile(userId);
  const postsQuery = useAdminBlogPosts({ authorId: userId, page, limit: 15, status: "ALL" });
  const deletePost = useDeleteBlogPost();

  const profile = profileQuery.data;
  const posts = postsQuery.data?.data ?? [];
  const meta = postsQuery.data?.meta;

  const rows = posts.map((post) => {
    const status = blogStatusChip((post as { status?: string }).status ?? "DRAFT");
    const extended = post as {
      status?: string;
      viewCount?: number;
      shareCount?: number;
      helpfulYes?: number;
      references?: unknown;
      peerReviewed?: boolean;
      reviewer?: { firstName: string; lastName: string } | null;
      _count?: { comments: number };
    };
    const citations = Array.isArray(extended.references) ? extended.references.length : 0;
    return [
      <div key={`${post.id}-title`} className="cell-user">
        {post.coverImageUrl ? (
          <Image
            src={post.coverImageUrl}
            alt=""
            width={48}
            height={48}
            className="article-cover-thumb"
            unoptimized
          />
        ) : (
          <div className="article-cover-thumb" />
        )}
        <div>
          <div className="cell-name">{post.title}</div>
          <div className="cell-sub">{post.category?.name ?? "—"}</div>
        </div>
      </div>,
      <StatusChip key={`${post.id}-st`} label={status.label} className={status.className} />,
      post.publishedAt ? formatDateTime(post.publishedAt) : "—",
      formatNumber(extended.viewCount ?? 0),
      formatNumber(extended.shareCount ?? 0),
      formatNumber(extended.helpfulYes ?? 0),
      formatNumber(citations),
      extended.peerReviewed ? (
        <StatusChip key={`${post.id}-rv`} label="Peer reviewed" className="ch-g" />
      ) : extended.reviewer ? (
        <StatusChip
          key={`${post.id}-rv`}
          label={`Reviewer: ${extended.reviewer.firstName} ${extended.reviewer.lastName}`}
          className="ch-a"
        />
      ) : (
        <StatusChip key={`${post.id}-rv`} label="Not reviewed" className="ch-gray" />
      ),
      <div key={`${post.id}-act`} className="btn-row">
        <Link href={adminBlogArticleHref(post.slug)} className="btn">
          View
        </Link>
        <AdminButton
          variant="danger"
          onClick={() => {
            if (!window.confirm(`Delete "${post.title}"?`)) return;
            deletePost.mutate(post.slug, {
              onSuccess: () => showToast("Article deleted"),
              onError: () => showToast("Delete failed"),
            });
          }}
        >
          Delete
        </AdminButton>
      </div>,
    ];
  });

  if (profileQuery.isLoading) {
    return <p>Loading doctor profile...</p>;
  }

  if (!profile || profile.role !== "DOCTOR") {
    return (
      <>
        <Link href="/admin/doctors" className="detail-back">
          ← Back to Doctors
        </Link>
        <p>This user is not a doctor or was not found.</p>
      </>
    );
  }

  return (
    <>
      <Link href={adminUserProfileHref(userId)} className="detail-back">
        ← Back to profile
      </Link>

      <div className="profile-hero">
        <UserAvatar firstName={profile.firstName} lastName={profile.lastName} seed={profile.id} />
        <div>
          <h2>
            Dr. {profile.firstName} {profile.lastName} — Articles
          </h2>
          <div className="cell-sub">
            {formatNumber(meta?.total ?? profile.stats.blogPostCount)} articles in database
          </div>
        </div>
      </div>

      <PanelTable
        title="Doctor Articles"
        headers={[
          "Article",
          "Status",
          "Published",
          "Views",
          "Shares",
          "Bookmarks",
          "Citations",
          "Review",
          "Actions",
        ]}
        rows={rows}
        loading={postsQuery.isLoading}
        pagerInfo={`Showing ${rows.length} of ${meta?.total ?? 0} articles`}
        page={page}
        totalPages={meta?.totalPages ?? 1}
        onPageChange={setPage}
        emptyMessage="No articles written by this doctor"
      />
    </>
  );
}
