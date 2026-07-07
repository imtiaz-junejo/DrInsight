import Link from "next/link";
import { CategoryIcon } from "@/components/blog/CategoryIcon";
import { getBlogCategoryVisuals } from "@/lib/blog-category";
import type { BlogPost } from "@/services/api-hooks";
import { mapBlogPostToCard } from "@/lib/data-mappers";

type FeaturedArticleCardProps = {
  post: BlogPost | null | undefined;
  isLoading?: boolean;
};

export function FeaturedArticleCard({ post, isLoading }: FeaturedArticleCardProps) {
  if (isLoading) {
    return (
      <div className="featured-card featured-card--skeleton" aria-hidden>
        <div className="featured-thumb featured-skeleton-thumb" />
        <div className="featured-body">
          <div className="featured-skeleton-line featured-skeleton-line--sm" />
          <div className="featured-skeleton-line featured-skeleton-line--title" />
          <div className="featured-skeleton-line featured-skeleton-line--meta" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="featured-card">
        <div className="featured-body">
          <p style={{ color: "rgba(255,255,255,0.75)" }}>No featured article yet.</p>
        </div>
      </div>
    );
  }

  const card = mapBlogPostToCard(post);
  const visuals = getBlogCategoryVisuals(post.category?.name ?? "");
  const badgeLabel = post.featured ? "Editor's Pick" : "Latest";

  return (
    <Link href={`/blog/${post.slug}`} className="featured-card featured-card--link">
      <div className="featured-thumb" style={{ background: `${visuals.thumbBg}66` }}>
        <CategoryIcon categoryName={post.category?.name ?? ""} size={56} />
        <div className="featured-badge">⭐ FEATURED</div>
      </div>
      <div className="featured-body">
        <div className="featured-cat">
          {post.category?.name ?? "Health"} · {badgeLabel}
        </div>
        <h3>{card.title}</h3>
        <p className="featured-excerpt">{card.excerpt}</p>
        <div className="featured-meta">
          <span>{card.author}</span> · <span>{card.read}</span> · <span>{card.date}</span>
        </div>
        <span className="featured-read-more">Read More →</span>
      </div>
    </Link>
  );
}
