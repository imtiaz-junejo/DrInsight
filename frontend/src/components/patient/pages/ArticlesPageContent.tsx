"use client";

import Link from "next/link";
import { EmptyState } from "@/components/patient/ui/PatientShared";
import { ActionButton, DashButton, DashCard, DashPageHeader } from "@/components/patient/ui/PatientPrimitives";
import { mapBlogPostToCard } from "@/lib/data-mappers";
import { todayFormatted } from "@/lib/patient-utils";
import { useSavedBlogPosts, useToggleBlogBookmark } from "@/services/patient-api-hooks";
import { usePatientUiStore } from "@/store/patient-ui.store";

export function ArticlesPageContent() {
  const showToast = usePatientUiStore((s) => s.showToast);
  const savedQuery = useSavedBlogPosts({ limit: 20 });
  const toggleBookmark = useToggleBlogBookmark();

  const articles = (savedQuery.data?.data ?? []).map((post) => ({
    ...mapBlogPostToCard(post),
    readPercent: post.readPercent ?? 0,
    slug: post.slug,
  }));
  const total = savedQuery.data?.meta.total ?? articles.length;

  return (
    <>
      <DashPageHeader
        subtitle="🏥 Patient Dashboard"
        title="Saved Articles"
        dateStr={todayFormatted()}
        actions={
          <Link href="/blog">
            <DashButton variant="solid">Browse More →</DashButton>
          </Link>
        }
      />

      <DashCard
        title="🔖 Reading List"
        headerExtra={<span style={{ fontSize: "0.76rem", color: "var(--gray-400)" }}>{total} articles saved</span>}
      >
        {savedQuery.isLoading ? (
          <EmptyState message="Loading saved articles..." />
        ) : articles.length > 0 ? (
          articles.map((art) => (
            <div key={art.slug} className="art-item">
              <div className="art-thumb" style={{ background: art.authorGradient }}>
                {art.emoji}
              </div>
              <div className="art-info">
                <div className="art-cat">{art.cat}</div>
                <div className="art-title">{art.title}</div>
                <div className="art-meta">
                  By {art.author} · {art.date} · {art.read}
                </div>
                <div className="art-bar">
                  <div className="art-fill" style={{ width: `${art.readPercent}%` }} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
                <Link href={`/blog/${art.slug}`}>
                  <ActionButton variant="primary">Read →</ActionButton>
                </Link>
                <ActionButton
                  variant="danger"
                  onClick={() =>
                    toggleBookmark.mutate(
                      { slug: art.slug, saved: true },
                      {
                        onSuccess: () => showToast("Article removed from reading list"),
                        onError: () => showToast("Could not remove article"),
                      },
                    )
                  }
                >
                  Remove
                </ActionButton>
              </div>
            </div>
          ))
        ) : (
          <EmptyState message="No saved articles yet. Browse the blog and bookmark articles to read later." />
        )}
      </DashCard>
    </>
  );
}
