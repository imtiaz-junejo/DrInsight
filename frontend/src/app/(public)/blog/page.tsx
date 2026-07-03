"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import "@/styles/blog-page.css";
import { formatStatCount, mapBlogPostToCard, specialtyEmoji } from "@/lib/data-mappers";
import { useBlogCategories, useBlogPosts, usePlatformStats } from "@/services/api-hooks";

const TRENDING = [
  {
    title: "Can You Reverse Type 2 Diabetes? The Science Behind Remission",
    meta: "Diabetes · Dr. Priya Sharma · 14.2k views",
  },
  {
    title: "The Omega-3 Debate: What the Latest Research Really Says",
    meta: "Nutrition · Dr. Javed Kumbhar · 11.8k views",
  },
  {
    title: "Stroke Warning Signs: Act FAST — Every Second Counts",
    meta: "Neurology · Dr. James Okafor · 9.6k views",
  },
  {
    title: "Sleep and Mental Health: The Bidirectional Relationship Explained",
    meta: "Mental Health · Dr. Emily Chen · 8.3k views",
  },
  {
    title: "When Should You Get a Colonoscopy? New Guidelines Explained",
    meta: "Gastroenterology · Dr. Ahmed Hassan · 7.1k views",
  },
];

const SIDEBAR_DOCS = [
  {
    initials: "JK",
    gradient: "linear-gradient(135deg,#1a56a0,#0891b2)",
    name: "Dr. Javed Kumbhar",
    spec: "Founder · Internal Medicine",
    count: "142 articles published",
  },
  {
    initials: "SM",
    gradient: "linear-gradient(135deg,#dc2626,#f59e0b)",
    name: "Dr. Sarah Mitchell",
    spec: "Cardiologist",
    count: "89 articles published",
  },
  {
    initials: "PS",
    gradient: "linear-gradient(135deg,#059669,#0891b2)",
    name: "Dr. Priya Sharma",
    spec: "Endocrinologist",
    count: "76 articles published",
  },
  {
    initials: "JO",
    gradient: "linear-gradient(135deg,#7c3aed,#4a90d9)",
    name: "Dr. James Okafor",
    spec: "Neurologist",
    count: "64 articles published",
  },
  {
    initials: "EC",
    gradient: "linear-gradient(135deg,#db2777,#f59e0b)",
    name: "Dr. Emily Chen",
    spec: "Psychiatrist / Gynaecologist",
    count: "58 articles published",
  },
];

const SPEC_TAGS = [
  { label: "Cardiology", type: "clinical" },
  { label: "Neurology", type: "clinical" },
  { label: "Psychiatry", type: "clinical" },
  { label: "Pediatrics", type: "clinical" },
  { label: "Oncology", type: "clinical" },
  { label: "Dermatology", type: "clinical" },
  { label: "Endocrinology", type: "clinical" },
  { label: "Pulmonology", type: "clinical" },
  { label: "General Surgery", type: "surgical" },
  { label: "Orthopedics", type: "surgical" },
  { label: "OB/GYN", type: "surgical" },
  { label: "Neurosurgery", type: "surgical" },
  { label: "Preventive Medicine", type: "other" },
  { label: "Nutrition", type: "other" },
  { label: "Sports Medicine", type: "other" },
  { label: "Sleep Medicine", type: "other" },
  { label: "Palliative Medicine", type: "other" },
];

type CatTab = "clinical" | "surgical" | "diagnostic" | "other";

const CATS_DATA: Record<
  CatTab,
  { ico: string; bg: string; name: string; count: string }[]
> = {
  clinical: [
    { ico: "❤️", bg: "#fef2f2", name: "Cardiology", count: "124 articles" },
    { ico: "🧠", bg: "#f3f0ff", name: "Neurology", count: "98 articles" },
    { ico: "🫁", bg: "#e0f7fa", name: "Pulmonology", count: "76 articles" },
    { ico: "🔬", bg: "#fff7ed", name: "Gastroenterology", count: "82 articles" },
    { ico: "🫘", bg: "#f0fdf4", name: "Nephrology", count: "54 articles" },
    { ico: "🩸", bg: "#fffbeb", name: "Endocrinology", count: "91 articles" },
    { ico: "🧬", bg: "#fdf4ff", name: "Oncology", count: "67 articles" },
    { ico: "🦠", bg: "#ecfdf5", name: "Infectious Disease", count: "88 articles" },
    { ico: "🧘", bg: "#eef2ff", name: "Psychiatry", count: "112 articles" },
    { ico: "👶", bg: "#f0fdf4", name: "Pediatrics", count: "95 articles" },
    { ico: "👴", bg: "#fffbeb", name: "Geriatrics", count: "43 articles" },
    { ico: "🩺", bg: "#f0f7ff", name: "Internal Medicine", count: "136 articles" },
    { ico: "🏠", bg: "#f8fafc", name: "Family Medicine", count: "78 articles" },
    { ico: "🚨", bg: "#fef2f2", name: "Emergency Medicine", count: "52 articles" },
    { ico: "💊", bg: "#f3f4f6", name: "Rheumatology", count: "61 articles" },
    { ico: "🦷", bg: "#fff7ed", name: "Dermatology", count: "87 articles" },
  ],
  surgical: [
    { ico: "🔪", bg: "#f0f7ff", name: "General Surgery", count: "48 articles" },
    { ico: "🧠", bg: "#f3f0ff", name: "Neurosurgery", count: "36 articles" },
    { ico: "❤️", bg: "#fef2f2", name: "Cardiothoracic Surgery", count: "42 articles" },
    { ico: "🩻", bg: "#f0fdf4", name: "Orthopedic Surgery", count: "71 articles" },
    { ico: "🤰", bg: "#fdf2f8", name: "OB/GYN", count: "93 articles" },
    { ico: "👁️", bg: "#e0f7fa", name: "Ophthalmology", count: "55 articles" },
    { ico: "👂", bg: "#fffbeb", name: "Otolaryngology (ENT)", count: "49 articles" },
    { ico: "💉", bg: "#ecfdf5", name: "Urology", count: "62 articles" },
  ],
  diagnostic: [
    { ico: "🩻", bg: "#f0f7ff", name: "Diagnostic Radiology", count: "38 articles" },
    { ico: "⚡", bg: "#fff7ed", name: "Interventional Radiology", count: "24 articles" },
    { ico: "🔬", bg: "#f3f4f6", name: "Histopathology", count: "19 articles" },
    { ico: "🩸", bg: "#fef2f2", name: "Hematopathology", count: "22 articles" },
    { ico: "☢️", bg: "#fffbeb", name: "Nuclear Medicine", count: "16 articles" },
    { ico: "😴", bg: "#eef2ff", name: "Anesthesiology", count: "31 articles" },
  ],
  other: [
    { ico: "🛡️", bg: "#ecfdf5", name: "Preventive Medicine", count: "104 articles" },
    { ico: "🌍", bg: "#e0f7fa", name: "Public Health", count: "67 articles" },
    { ico: "🏃", bg: "#f0fdf4", name: "Sports Medicine", count: "58 articles" },
    { ico: "😴", bg: "#eef2ff", name: "Sleep Medicine", count: "49 articles" },
    { ico: "🕊️", bg: "#f8fafc", name: "Palliative Medicine", count: "33 articles" },
    { ico: "🧬", bg: "#fdf4ff", name: "Medical Genetics", count: "27 articles" },
    { ico: "🍎", bg: "#ecfdf5", name: "Nutrition & Lifestyle", count: "118 articles" },
    { ico: "💼", bg: "#fffbeb", name: "Occupational Medicine", count: "41 articles" },
  ],
};

const CAT_TABS: { id: CatTab; label: string }[] = [
  { id: "clinical", label: "Clinical Specialties" },
  { id: "surgical", label: "Surgical Specialties" },
  { id: "diagnostic", label: "Diagnostic & Lab" },
  { id: "other", label: "Other Fields" },
];

export default function BlogPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [activeCatTab, setActiveCatTab] = useState<CatTab>("clinical");
  const mainWrapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: stats } = usePlatformStats();
  const { data: categories } = useBlogCategories();
  const { data: postsData, isLoading } = useBlogPosts({
    limit: 50,
    category: !isSearchMode && activeFilter !== "all" ? activeFilter : undefined,
    search: isSearchMode && searchQuery.trim() ? searchQuery.trim() : undefined,
  });

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
      };
    });
  }, [postsData]);

  const featured = blogPosts[0];

  function filterPosts(cat: string) {
    setIsSearchMode(false);
    setSearchQuery("");
    setActiveFilter(cat);
  }

  function doSearch() {
    const q = searchInputRef.current?.value ?? "";
    if (!q.trim()) return;
    setSearchQuery(q);
    setIsSearchMode(true);
    setActiveFilter("all");
    mainWrapRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="blog-page">
      <div className="breadcrumb">
        <div className="breadcrumb-inner">
          🏠 <Link href="/">Home</Link> › <span>Medical Blog</span>
        </div>
      </div>

      <div className="page-hero">
        <div className="hero-inner">
          <div className="hero-left">
            <div className="eyebrow">Evidence-Based Medical Blog</div>
            <h1>Doctor-Written Health Articles You Can Trust</h1>
            <p>
              {stats ? formatStatCount(stats.blogCount) : "1,000+"} peer-reviewed articles across every medical specialty — written and reviewed by
              board-certified physicians. No misinformation, ever.
            </p>
            <div className="hero-search">
              <input
                ref={searchInputRef}
                type="text"
                id="hero-search"
                placeholder="Search articles by condition, symptom, or specialty..."
                defaultValue=""
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
                <strong>{stats?.specialtyCount ?? "—"}</strong>
                <span>Specialties Covered</span>
              </div>
              <div className="h-stat">
                <strong>Weekly</strong>
                <span>New Content</span>
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
                  <div className="featured-cat">{featured.catLabel} · Editor&apos;s Pick</div>
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
                        {post.cat}
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

            <div className="load-more-wrap">
              <button type="button" className="load-more-btn">
                Load More Articles ↓
              </button>
            </div>

            <div className="trending-section">
              <div className="section-eyebrow" style={{ marginTop: 36 }}>
                Most Read This Week
              </div>
              <div className="section-title">Trending Articles</div>
              <div className="trending-list">
                {TRENDING.map((item, i) => (
                  <div key={item.title} className="trending-item">
                    <div className="trending-num">{i + 1}</div>
                    <div>
                      <h4>{item.title}</h4>
                      <span>{item.meta}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="subscribe-card">
              <h4>📬 Weekly Health Digest</h4>
              <p>Get the week&apos;s best medical articles curated by Dr. Javed Kumbhar, delivered every Monday.</p>
              <input type="email" placeholder="Your email address" />
              <button type="button">Subscribe Free →</button>
              <p className="subscribe-note">🔒 No spam. Unsubscribe anytime.</p>
            </div>

            <div className="sidebar-card">
              <h4>Top Author Doctors</h4>
              {SIDEBAR_DOCS.map((doc) => (
                <div key={doc.name} className="sidebar-doc">
                  <div className="doc-av" style={{ background: doc.gradient }}>
                    {doc.initials}
                  </div>
                  <div>
                    <div className="doc-name">{doc.name}</div>
                    <div className="doc-spec">{doc.spec}</div>
                    <div className="doc-count">{doc.count}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="sidebar-card">
              <h4>Browse by Specialty</h4>
              <div className="spec-tag-cloud">
                {SPEC_TAGS.map((tag) => (
                  <span key={tag.label} className={`spec-tag ${tag.type}`}>
                    {tag.label}
                  </span>
                ))}
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
            <div className="section-eyebrow">All Specialties</div>
            <h2>Browse by Medical Category</h2>
            <p>Explore our full library of doctor-written articles across every medical field</p>
          </div>
          <div className="cats-tabs">
            {CAT_TABS.map((tab) => (
              <div
                key={tab.id}
                className={`cats-tab${activeCatTab === tab.id ? " active" : ""}`}
                onClick={() => setActiveCatTab(tab.id)}
                onKeyDown={(e) => e.key === "Enter" && setActiveCatTab(tab.id)}
                role="button"
                tabIndex={0}
              >
                {tab.label}
              </div>
            ))}
          </div>
          <div className="cats-grid" id="cats-grid">
            {CATS_DATA[activeCatTab].map((cat) => (
              <div key={cat.name} className="cat-tile">
                <div className="cat-tile-ico" style={{ background: cat.bg }}>
                  {cat.ico}
                </div>
                <div>
                  <h4>{cat.name}</h4>
                  <span>{cat.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cta-band">
        <div className="section-eyebrow" style={{ color: "#93c5fd" }}>
          Never Stop Learning
        </div>
        <h2>Stay Informed with Weekly Health Insights</h2>
        <p>Join 50,000+ readers who get our curated weekly digest of the best new articles from our doctors.</p>
        <div className="cta-btns">
          <button type="button" className="btn-white">
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
