"use client";

import Link from "next/link";
import { EmptyState } from "@/components/patient/ui/PatientShared";
import { ActionButton, DashButton, DashCard, DashPageHeader } from "@/components/patient/ui/PatientPrimitives";
import { mapBlogPostToCard } from "@/lib/data-mappers";
import { todayFormatted } from "@/lib/patient-utils";
import { useBlogPosts } from "@/services/api-hooks";
import { usePatientUiStore } from "@/store/patient-ui.store";

export function ArticlesPageContent() {
  const showToast = usePatientUiStore((s) => s.showToast);
  const blogQuery = useBlogPosts({ limit: 20 });
  const articles = (blogQuery.data?.data ?? []).map(mapBlogPostToCard);
  const total = blogQuery.data?.meta.total ?? articles.length;

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
        headerExtra={<span style={{ fontSize: "0.76rem", color: "var(--gray-400)" }}>{total} articles available</span>}
      >
        {blogQuery.isLoading ? (
          <EmptyState message="Loading articles..." />
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
                  <div className="art-fill" style={{ width: "0%" }} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
                <Link href={`/blog/${art.slug}`}>
                  <ActionButton variant="primary" onClick={() => showToast("Opening article...")}>
                    Read →
                  </ActionButton>
                </Link>
                <ActionButton variant="danger" onClick={() => showToast("Saved articles are suggested from the blog")}>
                  Remove
                </ActionButton>
              </div>
            </div>
          ))
        ) : (
          <EmptyState message="No articles available in the reading list." />
        )}
      </DashCard>
    </>
  );
}
