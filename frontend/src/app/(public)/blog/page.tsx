"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import "@/styles/blog-page.css";
import {
  doctorFullName,
  formatStatCount,
  getInitials,
  gradientForId,
  mapBlogPostToCard,
  specialtyEmoji,
} from "@/lib/data-mappers";
import {
  useBlogCategories,
  useBlogPosts,
  useNewsletterSubscribe,
  usePlatformStats,
  usePopularBlogPosts,
  useTopBlogAuthors,
} from "@/services/api-hooks";

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function BlogPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMsg, setNewsletterMsg] = useState("");
  const [limit, setLimit] = useState(12);
  const mainWrapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: stats } = usePlatformStats();
  const { data: categories } = useBlogCategories();
  const { data: postsData, isLoading } = useBlogPosts({
    limit,
    page: 1,
    category: !isSearchMode && activeFilter !== "all" ? activeFilter : undefined,
    search: isSearchMode && searchQuery.trim() ? searchQuery.trim() : undefined,
  });
  const { data: popularPosts } = usePopularBlogPosts(5);
  const { data: topAuthors } = useTopBlogAuthors(5);
  const newsletter = useNewsletterSubscribe();

  const filterPills = useMemo(
    () => [
      { id: "all", label: "All" },
      ...(categories ?? []).map((c) => ({
        id: c.slug,
        label: `${specialtyEmoji(c.name)} ${c.name}`,
      })),
    ],
    [categories],
  );

  const blogPosts = useMemo(() => {
    return (postsData?.data ?? []).map((post) => {
      const card = mapBlogPostToCard(post);
      return {
        ...card,
        cat: post.category?.slug ?? "all",
        thumbBg: "#f0f7ff",
        badgeBg: "#1a56a0",
        catLabel: post.category?.name ?? "Health",
        catColor: "#1a56a0",
        readTime: card.read.replace(" read", ""),
        views: post.viewCount ?? 0,
      };
    });
  }, [postsData]);

  const featured = blogPosts[0];
  const totalPosts = postsData?.meta.total ?? 0;
  const hasMore = blogPosts.length < totalPosts;

  function filterPosts(cat: string) {
    setIsSearchMode(false);
    setSearchQuery("");
    setActiveFilter(cat);
    setLimit(12);
  }

  function doSearch() {
    const q = searchInputRef.current?.value ?? "";
    if (!q.trim()) return;
    setSearchQuery(q);
    setIsSearchMode(true);
    setActiveFilter("all");
    setLimit(12);
    mainWrapRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    try {
      await newsletter.mutateAsync(newsletterEmail.trim());
      setNewsletterMsg("Subscribed successfully!");
      setNewsletterEmail("");
    } catch {
      setNewsletterMsg("Subscription failed. Please try again.");
    }
  }

  return (
    <div className="blog-page">
      <div className="page-hero">
        <div className="hero-inner">
          <div className="hero-left">
            <div className="eyebrow">Evidence-Based Medical Blog</div>
            <h1>Doctor-Written Health Articles You Can Trust</h1>
            <p>
              {stats ? formatStatCount(stats.blogCount) : "—"} peer-reviewed articles across every medical specialty —
              written and reviewed by board-certified physicians. No misinformation, ever.
            </p>
            <div className="hero-search">
              <input
                ref={searchInputRef}
                type="text"
                id="hero-search"
                placeholder="Search articles by condition, symptom, or specialty..."
                defaultValue=""
                onKeyDown={(e) => e.key === "Enter" && doSearch()}
              />
              <button type="button" onClick={doSearch}>
                🔍 Search
              </button>
            </div>
            <div className="hero-stats">
              <div className="h-stat">
                <strong>{stats ? formatStatCount(stats.blogCount) : "—"}</strong>
                <span>Articles Published</span>
              </div>
              <div className="h-stat">
                <strong>{stats ? formatStatCount(stats.doctorCount) : "—"}</strong>
                <span>Doctor Authors</span>
              </div>
              <div className="h-stat">
                <strong>{stats?.specialtyCount ?? categories?.length ?? "—"}</strong>
                <span>Specialties Covered</span>
              </div>
              <div className="h-stat">
                <strong>{stats ? formatStatCount(stats.reviewCount ?? 0) : "—"}</strong>
                <span>Patient Reviews</span>
              </div>
            </div>
          </div>
          <div>
            {featured ? (
              <Link href={`/blog/${featured.slug}`} className="featured-card">
                <div className="featured-thumb">
                  {featured.emoji}
                  <div className="featured-badge">⭐ FEATURED</div>
                </div>
                <div className="featured-body">
                  <div className="featured-cat">{featured.catLabel} · Latest</div>
                  <h3>{featured.title}</h3>
                  <div className="featured-meta">
                    <span>{featured.author}</span> · <span>{featured.read}</span> · <span>{featured.date}</span>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="featured-card">
                <div className="featured-body">
                  <p style={{ color: "var(--gray-500)" }}>No featured article yet.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="main-wrap" ref={mainWrapRef}>
        <div className="blog-layout">
          <div>
            <div className="section-eyebrow">Latest Articles</div>
            <div className="section-title">Recent Medical Insights</div>

            <div className="filter-bar" id="filter-bar">
              {filterPills.map((pill) => (
                <div
                  key={pill.id}
                  className={`filter-pill${!isSearchMode && activeFilter === pill.id ? " active" : ""}`}
                  onClick={() => filterPosts(pill.id)}
                  onKeyDown={(e) => e.key === "Enter" && filterPosts(pill.id)}
                  role="button"
                  tabIndex={0}
                >
                  {pill.label}
                </div>
              ))}
            </div>

            <div className="blog-grid" id="blog-grid">
              {isLoading ? (
                <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "var(--gray-500)" }}>Loading articles...</p>
              ) : blogPosts.length > 0 ? (
                blogPosts.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-card" data-cat={post.cat}>
                    <div className="blog-thumb" style={{ background: post.thumbBg }}>
                      {post.emoji}
                      <div className="blog-badge" style={{ background: post.badgeBg }}>
                        {post.catLabel}
                      </div>
                    </div>
                    <div className="blog-body">
                      <div className="blog-cat-label" style={{ color: post.catColor }}>
                        {post.catLabel}
                      </div>
                      <h3>{post.title}</h3>
                      <p>{post.excerpt}</p>
                      <div className="blog-footer">
                        <div className="blog-meta-sm">
                          <div className="author-dot" style={{ background: post.authorGradient }}>
                            {post.authorInitials}
                          </div>
                          <span>{post.author}</span>
                        </div>
                        <div className="read-time">⏱ {post.readTime}</div>
                        <span className="read-more-link">Read →</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="no-results" id="no-results">
                  <div className="no-results-icon">🔍</div>
                  <p>No articles match your search or filter. Try different keywords.</p>
                </div>
              )}
            </div>

            {hasMore && (
              <div className="load-more-wrap">
                <button type="button" className="load-more-btn" onClick={() => setLimit((n) => n + 12)}>
                  Load More Articles ↓
                </button>
              </div>
            )}

            <div className="trending-section">
              <div className="section-eyebrow" style={{ marginTop: 36 }}>
                Most Read
              </div>
              <div className="section-title">Trending Articles</div>
              <div className="trending-list">
                {(popularPosts ?? []).map((item, i) => (
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
                {!popularPosts?.length && (
                  <p style={{ color: "var(--gray-500)" }}>No trending articles yet.</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <form className="subscribe-card" onSubmit={handleNewsletter}>
              <h4>📬 Weekly Health Digest</h4>
              <p>Get the week&apos;s best medical articles delivered every Monday.</p>
              <input
                type="email"
                placeholder="Your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
              />
              <button type="submit" disabled={newsletter.isPending}>
                {newsletter.isPending ? "Subscribing..." : "Subscribe Free →"}
              </button>
              {newsletterMsg && <p className="subscribe-note">{newsletterMsg}</p>}
              <p className="subscribe-note">🔒 No spam. Unsubscribe anytime.</p>
            </form>

            <div className="sidebar-card">
              <h4>Top Author Doctors</h4>
              {(topAuthors ?? []).map((doc) => (
                <div key={doc.id} className="sidebar-doc">
                  <div className="doc-av" style={{ background: gradientForId(doc.id) }}>
                    {getInitials(doc.firstName, doc.lastName)}
                  </div>
                  <div>
                    <div className="doc-name">{doctorFullName(doc)}</div>
                    <div className="doc-spec">{doc.platformRole ?? doc.specialty ?? "Author"}</div>
                    <div className="doc-count">{doc.articleCount} articles published</div>
                  </div>
                </div>
              ))}
              {!topAuthors?.length && <p style={{ color: "var(--gray-500)" }}>No authors yet.</p>}
            </div>

            <div className="sidebar-card">
              <h4>Browse by Category</h4>
              <div className="spec-tag-cloud">
                {(categories ?? []).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className="spec-tag clinical"
                    onClick={() => filterPosts(cat.slug)}
                  >
                    {cat.name} ({cat.postCount ?? 0})
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-card advice-card">
              <h4>🩺 Need Medical Advice?</h4>
              <p>
                Reading articles is a great start — but a doctor consultation gives you personalised guidance.
              </p>
              <Link href="/book-consultation" className="advice-btn-primary">
                📅 Book Consultation
              </Link>
              <Link href="/ask-doctor" className="advice-btn-secondary">
                💬 Ask a Doctor Free
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="cats-section">
        <div className="cats-inner">
          <div className="cats-section-header">
            <div className="section-eyebrow">All Categories</div>
            <h2>Browse by Medical Category</h2>
            <p>Explore our full library of doctor-written articles across every medical field</p>
          </div>
          <div className="cats-grid" id="cats-grid">
            {(categories ?? []).map((cat) => (
              <button
                key={cat.id}
                type="button"
                className="cat-tile"
                onClick={() => filterPosts(cat.slug)}
              >
                <div className="cat-tile-ico" style={{ background: "#f0f7ff" }}>
                  {specialtyEmoji(cat.name)}
                </div>
                <div>
                  <h4>{cat.name}</h4>
                  <span>{cat.postCount ?? 0} articles</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="cta-band">
        <div className="section-eyebrow" style={{ color: "#93c5fd" }}>
          Never Stop Learning
        </div>
        <h2>Stay Informed with Weekly Health Insights</h2>
        <p>
          Join {stats ? formatStatCount(stats.newsletterCount ?? stats.patientCount) : "—"} readers who get our
          curated weekly digest of the best new articles from our doctors.
        </p>
        <div className="cta-btns">
          <button
            type="button"
            className="btn-white"
            onClick={() => mainWrapRef.current?.scrollIntoView({ behavior: "smooth" })}
          >
            📬 Subscribe Free
          </button>
          <Link href="/book-consultation" className="btn-ghost">
            📅 Book a Consultation
          </Link>
        </div>
      </div>
    </div>
  );
}
