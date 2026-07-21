import Link from "next/link";
import { CategoryIcon } from "@/components/blog/CategoryIcon";
import { categoryAccentStyle, getBlogCategoryVisuals } from "@/lib/blog-category";
import { mapBlogPostToCard } from "@/lib/data-mappers";
import type { BlogPost } from "@/services/api-hooks";

type BlogArticleCardProps = {
  post: BlogPost;
};

export function BlogArticleCard({ post }: BlogArticleCardProps) {
  const card = mapBlogPostToCard(post);
  const visuals = getBlogCategoryVisuals(post.category?.name ?? "");
  const catLabel = post.category?.name ?? "Health";

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="blog-card blog-card--accent bg-gray-100 border-[1.5px] border-gray-300"
      data-cat={post.category?.slug ?? "all"}
      style={categoryAccentStyle(visuals)}
    >
      <div className="blog-thumb" style={{ background: visuals.thumbBg }}>
        <CategoryIcon categoryName={post.category?.name ?? ""} size={44} />
        <div className="blog-badge" style={{ background: visuals.badgeBg }}>
          {catLabel.toUpperCase()}
        </div>
      </div>
      <div className="blog-body">
        <div className="blog-cat-label" style={{ color: visuals.catColor }}>
          {catLabel}
        </div>
        <h3>{card.title}</h3>
        <p>{card.excerpt}</p>
        <div className="blog-footer">
          <div className="blog-meta-sm">
            <div className="author-dot" style={{ background: card.authorGradient }}>
              {card.authorInitials}
            </div>
            <span>{card.author}</span>
          </div>
          <div className="read-time">⏱ {post.readTimeMinutes} min</div>
          <span className="read-more-link">Read →</span>
        </div>
      </div>
    </Link>
  );
}

export function BlogArticleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="blog-card blog-card--skeleton bg-gray-100 border-[1.5px] border-gray-300" aria-hidden>
          <div className="blog-thumb blog-skeleton-thumb" />
          <div className="blog-body">
            <div className="blog-skeleton-line blog-skeleton-line--sm" />
            <div className="blog-skeleton-line blog-skeleton-line--title" />
            <div className="blog-skeleton-line blog-skeleton-line--excerpt" />
            <div className="blog-skeleton-line blog-skeleton-line--footer" />
          </div>
        </div>
      ))}
    </>
  );
}
