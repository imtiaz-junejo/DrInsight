import Link from "next/link";
import { SectionEyebrow, SectionDescription, SectionTitle } from "@/components/public/section-heading";
import { doctorFullName } from "@/lib/data-mappers";
import type { BlogPost } from "@/services/api-hooks";

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

type TrendingArticlesSectionProps = {
  posts: BlogPost[] | undefined;
  isLoading?: boolean;
};

export function TrendingArticlesSection({ posts, isLoading }: TrendingArticlesSectionProps) {
  return (
    <div className="trending-section">
      <SectionEyebrow className="section-eyebrow">Most Read This Week</SectionEyebrow>
      <SectionTitle as="div" className="section-title !text-2xl">
        Trending Articles
      </SectionTitle>
      <div className="trending-list">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="trending-item trending-item--skeleton" aria-hidden>
                <div className="trending-num trending-skeleton-num" />
                <div className="trending-skeleton-body">
                  <div className="trending-skeleton-line trending-skeleton-line--title" />
                  <div className="trending-skeleton-line trending-skeleton-line--meta" />
                </div>
              </div>
            ))
          : (posts ?? []).map((item, i) => (
              <Link key={item.id} href={`/blog/${item.slug}`} className="trending-item">
                <div className="trending-num">{i + 1}</div>
                <div>
                  <h4>{item.title}</h4>
                  <span>
                    {item.category?.name ?? "Health"} · {doctorFullName(item.author)} ·{" "}
                    {formatViews(item.viewCount ?? 0)} views
                  </span>
                </div>
              </Link>
            ))}
        {!isLoading && !posts?.length && (
          <p className="trending-empty">No trending articles yet.</p>
        )}
      </div>
    </div>
  );
}
