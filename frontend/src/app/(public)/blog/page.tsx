"use client";

import Link from "next/link";
import { Suspense, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "@/styles/blog-page.css";
import { AllSpecialtiesSection } from "@/components/blog/AllSpecialtiesSection";
import { BlogArticleCard, BlogArticleGridSkeleton } from "@/components/blog/BlogArticleCard";
import { CategoryIcon } from "@/components/blog/CategoryIcon";
import { FeaturedArticleCard } from "@/components/blog/FeaturedArticleCard";
import { TrendingArticlesSection } from "@/components/blog/TrendingArticlesSection";
import {
  SectionEyebrow,
  SectionHeading,
  SectionTitle,
} from "@/components/public/section-heading";
import {
  ensureCategorySlugFirstInPosts,
  getBlogCategoryVisuals,
  resolveCardiologyHeroPost,
  resolveCardiologySlug,
  sortCategoriesWithCardiologyFirst,
} from "@/lib/blog-category";
import {
  doctorFullName,
  formatStatCount,
  getInitials,
  gradientForId,
} from "@/lib/data-mappers";
import {
  useBlogCategories,
  useBlogPosts,
  useNewsletterSubscribe,
  usePlatformStats,
  usePopularBlogPosts,
  useTopBlogAuthors,
} from "@/services/api-hooks";

function BlogPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMsg, setNewsletterMsg] = useState("");
  const [limit, setLimit] = useState(12);
  const mainWrapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeFilter = isSearchMode ? "all" : categoryParam ?? "all";

  const { data: stats } = usePlatformStats();
  const { data: categories, isLoading: categoriesLoading } = useBlogCategories();

  const cardiologySlug = useMemo(
    () => resolveCardiologySlug(categories),
    [categories],
  );

  const { data: cardioData, isLoading: cardioLoading } = useBlogPosts(
    {
      limit: 20,
      page: 1,
      category: cardiologySlug,
      sort: "recent",
    },
    { enabled: !!cardiologySlug },
  );
  const { data: fallbackHeroData, isLoading: fallbackHeroLoading } = useBlogPosts({
    limit: 1,
    page: 1,
    sort: "recent",
  });
  const listSort =
    !isSearchMode && !categoryParam ? ("mixed" as const) : ("recent" as const);

  const { data: postsData, isLoading: postsLoading } = useBlogPosts({
    limit,
    page: 1,
    category: !isSearchMode && categoryParam ? categoryParam : undefined,
    search: isSearchMode && searchQuery.trim() ? searchQuery.trim() : undefined,
    sort: listSort,
  });
  const { data: popularPosts, isLoading: popularLoading } = usePopularBlogPosts(5);
  const { data: topAuthors } = useTopBlogAuthors(5);
  const newsletter = useNewsletterSubscribe();

  const heroPost = useMemo(
    () => resolveCardiologyHeroPost(cardioData?.data, fallbackHeroData?.data?.[0]),
    [cardioData, fallbackHeroData],
  );

  const heroLoading = useMemo(() => {
    if (categoriesLoading) return true;
    if (cardiologySlug) {
      if (cardioLoading) return true;
      if (!(cardioData?.data?.length ?? 0) && fallbackHeroLoading) return true;
      return false;
    }
    return fallbackHeroLoading;
  }, [
    categoriesLoading,
    cardiologySlug,
    cardioLoading,
    cardioData,
    fallbackHeroLoading,
  ]);

  const activeCategory = useMemo(
    () => (categoryParam ? categories?.find((c) => c.slug === categoryParam) : undefined),
    [categories, categoryParam],
  );

  const filterPills = useMemo(
    () => [
      { id: "all", label: "All", categoryName: null as string | null },
      ...sortCategoriesWithCardiologyFirst(categories ?? [], cardiologySlug).map((c) => ({
        id: c.slug,
        label: c.name,
        categoryName: c.name,
      })),
    ],
    [categories, cardiologySlug],
  );

  const gridPosts = useMemo(() => {
    let posts = postsData?.data ?? [];
    if (!isSearchMode && !categoryParam && heroPost) {
      posts = posts.filter((p) => p.slug !== heroPost.slug);
    }
    if (!isSearchMode && !categoryParam) {
      posts = ensureCategorySlugFirstInPosts(posts, cardiologySlug, {
        supplementalPosts: cardioData?.data,
        excludeSlug: heroPost?.slug,
        maxLength: limit,
      });
    }
    return posts;
  }, [postsData, isSearchMode, categoryParam, heroPost, cardiologySlug, cardioData, limit]);

  const totalPosts = postsData?.meta.total ?? 0;
  const hasMore = (postsData?.data?.length ?? 0) < totalPosts;

  function filterPosts(cat: string) {
    setIsSearchMode(false);
    setSearchQuery("");
    setLimit(12);
    if (cat === "all") {
      router.replace("/blog", { scroll: false });
    } else {
      router.replace(`/blog?category=${encodeURIComponent(cat)}`, { scroll: false });
    }
    mainWrapRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function doSearch() {
    const q = searchInputRef.current?.value ?? "";
    if (!q.trim()) return;
    setSearchQuery(q);
    setIsSearchMode(true);
    setLimit(12);
    router.replace("/blog", { scroll: false });
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

  const sectionTitle =
    isSearchMode && searchQuery.trim()
      ? `Results for "${searchQuery.trim()}"`
      : "Recent Medical Insights";

  const emptyMessage =
    isSearchMode
      ? "No articles match your search. Try different keywords."
      : activeCategory
        ? "No articles available in this specialty yet."
        : "No articles match your search or filter. Try different keywords.";

  return (
    <div className="blog-page">
      <div className="page-hero">
        <div className="hero-inner">
          <div className="hero-left">
            <div className="eyebrow">Evidence-Based Medical Blog</div>
            <h1>Doctor-Written Health Articles You Can Trust</h1>
            <p>
              {stats ? formatStatCount(stats.blogCount) : "—"} peer-reviewed articles across every medical
              specialty — written and reviewed by board-certified physicians. No misinformation, ever.
            </p>
            <div className="hero-search">
              <input
                ref={searchInputRef}
                type="text"
                id="hero-search"
                className="bg-white"
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
            <FeaturedArticleCard post={heroPost} isLoading={heroLoading} />
          </div>
        </div>
      </div>

      <div className="main-wrap" ref={mainWrapRef}>
        <div className="blog-layout sticky-sidebar-layout">
          <div className="articles-col sticky-sidebar-main">
            <SectionEyebrow className="section-eyebrow">Latest Articles</SectionEyebrow>
            <SectionTitle as="div" className="section-title !text-2xl">
              {sectionTitle}
            </SectionTitle>

            <div className="filter-bar" id="filter-bar">
              {filterPills.map((pill) => (
                <div
                  key={pill.id}
                  className={`filter-pill filter-pill--with-icon${!isSearchMode && activeFilter === pill.id ? " active" : ""}`}
                  onClick={() => filterPosts(pill.id)}
                  onKeyDown={(e) => e.key === "Enter" && filterPosts(pill.id)}
                  role="button"
                  tabIndex={0}
                >
                  {pill.categoryName && (
                    <CategoryIcon categoryName={pill.categoryName} size={14} />
                  )}
                  {pill.label}
                </div>
              ))}
            </div>

            <div className="blog-grid" id="blog-grid">
              {postsLoading ? (
                <BlogArticleGridSkeleton count={6} />
              ) : gridPosts.length > 0 ? (
                gridPosts.map((post) => <BlogArticleCard key={post.id} post={post} />)
              ) : (
                <div className="no-results" id="no-results">
                  <div className="no-results-icon">🔍</div>
                  <p>{emptyMessage}</p>
                </div>
              )}
            </div>

            {hasMore && !postsLoading && (
              <div className="load-more-wrap">
                <button type="button" className="load-more-btn" onClick={() => setLimit((n) => n + 12)}>
                  Load More Articles ↓
                </button>
              </div>
            )}

            <TrendingArticlesSection posts={popularPosts} isLoading={popularLoading} />
          </div>

          <aside className="sticky-sidebar-col" aria-label="Blog sidebar">
            <div className="sticky-sidebar-panel bg-gray-100">
              <div className="sticky-sidebar-scroll">
                <form className="subscribe-card" onSubmit={handleNewsletter}>
                  <h4>📬 Weekly Health Digest</h4>
                  <p>Get the week&apos;s best medical articles delivered every Monday.</p>
                  <input
                    type="email"
                    className="border-gray-300"
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
                  <h4>Browse by Specialty</h4>
                  <div className="spec-tag-cloud">
                    {(sortCategoriesWithCardiologyFirst(categories ?? [], cardiologySlug)).map((cat) => {
                      const visuals = getBlogCategoryVisuals(cat.name);
                      const isActive = !isSearchMode && activeFilter === cat.slug;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          className={`spec-tag spec-tag--accent ${visuals.specTagClass}${isActive ? " active" : ""}`}
                          style={
                            isActive
                              ? {
                                  borderColor: visuals.catColor,
                                  color: visuals.catColor,
                                  background: `${visuals.iconBg}`,
                                }
                              : undefined
                          }
                          onClick={() => filterPosts(cat.slug)}
                        >
                          {cat.name} ({cat.postCount ?? 0})
                        </button>
                      );
                    })}
                  </div>
                  <div className="spec-legend">
                    <span className="spec-legend-item" style={{ color: "var(--blue)" }}>
                      <span className="spec-legend-dot" style={{ background: "var(--blue)" }} />
                      Clinical
                    </span>
                    <span className="spec-legend-item" style={{ color: "var(--teal)" }}>
                      <span className="spec-legend-dot" style={{ background: "var(--teal)" }} />
                      Surgical
                    </span>
                    <span className="spec-legend-item" style={{ color: "var(--purple)" }}>
                      <span className="spec-legend-dot" style={{ background: "var(--purple)" }} />
                      Other
                    </span>
                  </div>
                </div>

                <div className="sidebar-card advice-card">
                  <h4>🩺 Need Medical Advice?</h4>
                  <p>
                    Reading articles is a great start — but a doctor consultation gives you personalised
                    guidance.
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
          </aside>
        </div>
      </div>

      <AllSpecialtiesSection
        categories={categories}
        activeCategorySlug={!isSearchMode ? categoryParam : null}
        onSelectCategory={filterPosts}
        isLoading={categoriesLoading}
      />

      <div className="cta-band">
        <SectionHeading
          className="!mb-0"
          eyebrow="Never Stop Learning"
          title="Stay Informed with Weekly Health Insights"
          description={`Join ${stats ? formatStatCount(stats.newsletterCount ?? stats.patientCount) : "—"} readers who get our curated weekly digest of the best new articles from our doctors.`}
          inverse
          lightEyebrow
        />
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

export default function BlogPage() {
  return (
    <Suspense
      fallback={
        <div className="blog-page" style={{ padding: "48px 18px", textAlign: "center", color: "#475569" }}>
          Loading blog...
        </div>
      }
    >
      <BlogPageContent />
    </Suspense>
  );
}
