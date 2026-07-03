"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import "@/styles/sitemap-page.css";
import { doctorFullName, specialtyEmoji } from "@/lib/data-mappers";
import { useBlogCategories, useDoctors } from "@/services/api-hooks";

type Category = "all" | "public" | "content" | "editorial" | "legal" | "auth" | "dashboard";

type SmTagType = "done" | "dynamic" | "auth" | "new";

interface SmTag {
  type: SmTagType;
  label: string;
}

interface SmItemData {
  href: string;
  priority?: "high" | "med" | "low";
  dotColor: string;
  title: string;
  url: string;
  tags: SmTag[];
}

const FILTERS: { cat: Category; label: string }[] = [
  { cat: "all", label: "All (26)" },
  { cat: "public", label: "🌐 Public (11)" },
  { cat: "content", label: "📰 Content (3)" },
  { cat: "editorial", label: "📋 Editorial (3)" },
  { cat: "legal", label: "⚖️ Legal (4)" },
  { cat: "auth", label: "🔐 Auth (4)" },
  { cat: "dashboard", label: "📊 Dashboards (1)" },
];

const CATEGORY_COLORS = ["#fef2f2", "#f5f3ff", "#f0fdf4", "#eff6ff", "#fffbeb", "#ecfdf5"];

const ADMIN_TAGS = [
  "Users",
  "Doctors",
  "Patients",
  "Roles",
  "Appointments",
  "Consultation Requests",
  "Prescriptions",
  "Blog Posts",
  "Categories",
  "Tags",
  "Comments",
  "Authors",
  "Review Queue",
  "Email Templates",
  "OTP Templates",
  "Notifications",
  "Homepage Sections",
  "Health Tools",
  "FAQs",
  "Contact Inquiries",
  "SEO Settings",
  "Traffic Analytics",
  "Consultation Analytics",
  "Revenue Analytics",
];

function SmTagBadge({ tag }: { tag: SmTag }) {
  return <span className={`sm-tag tag-${tag.type}`}>{tag.label}</span>;
}

function SmItemLink({
  href,
  priority,
  dotColor,
  title,
  url,
  tags,
}: SmItemData) {
  const priorityClass = priority ? `priority-${priority}` : "";
  return (
    <Link href={href} className={`sm-item ${priorityClass}`.trim()}>
      <div className="sm-item-dot" style={{ background: dotColor }} />
      <div className="sm-item-info">
        <span className="sm-item-title">{title}</span>
        <span className="sm-item-url">{url}</span>
        <div className="sm-item-meta">
          {tags.map((tag) => (
            <SmTagBadge key={`${title}-${tag.label}`} tag={tag} />
          ))}
        </div>
      </div>
      <div className="sm-arrow">→</div>
    </Link>
  );
}

function SmList({ items }: { items: SmItemData[] }) {
  return (
    <div className="sm-list">
      {items.map((item) => (
        <SmItemLink key={`${item.title}-${item.url}`} {...item} />
      ))}
    </div>
  );
}

function getSectionSearchText(...parts: string[]) {
  return parts.join(" ").toLowerCase();
}

export function SitemapPageContent() {
  const [activeCat, setActiveCatState] = useState<Category>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doctorsQuery = useDoctors({ limit: 8 });
  const categoriesQuery = useBlogCategories();
  const featuredDoctors = doctorsQuery.data?.data ?? [];
  const articleCategories = categoriesQuery.data ?? [];

  const specialtyCards = useMemo(
    () =>
      articleCategories.slice(0, 8).map((cat, i) => ({
        icon: specialtyEmoji(cat.name),
        name: cat.name,
        count: "Articles",
        url: `/blog?category=${cat.slug}`,
        bg: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      })),
    [articleCategories],
  );

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2600);
  }, []);

  const setCat = useCallback((cat: Category) => {
    setActiveCatState(cat);
  }, []);

  const filterSitemap = useCallback((q: string) => {
    setSearchQuery(q);
  }, []);

  const sectionSearchTexts = useMemo(
    () => ({
      core: getSectionSearchText(
        "Core Pages Main public-facing pages Home About Us Contact FAQ Health Tools Ask the Doctor Book Consultation / /about /contact /faq /health-tools /ask-the-doctor /book-consultation",
      ),
      doctors: getSectionSearchText(
        "Doctor Directory Find book specialists Doctors Directory Doctor Profile Bio Book with a Doctor Featured Doctors Dr. Kumbhar Dr. Mitchell Dr. Okafor Dr. Sharma Dr. Chen Dr. Rivera Dr. Hassan /doctors /doctors/dr- /book-consultation?doctor=",
      ),
      content: getSectionSearchText(
        "Content Pages Articles blog authors Blog Listing Single Article Author Bio Page Article Categories Cardiology Neurology Endocrinology Mental Health Pediatrics Nutrition /blog /articles/ /authors/",
      ),
      editorial: getSectionSearchText(
        "Editorial Trust Standards transparency Editorial Policy Medical Review Process Author Guidelines /editorial-policy /medical-review-process /author-guidelines",
      ),
      legal: getSectionSearchText(
        "Legal Policy Privacy terms compliance Privacy Policy Terms Conditions Medical Disclaimer Cookie Policy /privacy-policy /terms-and-conditions /disclaimer /cookie-policy",
      ),
      auth: getSectionSearchText(
        "Authentication Login register reset Forgot Password Reset Password /login /register /forgot-password /reset-password",
      ),
      patient: getSectionSearchText(
        "Patient Dashboard Logged-in patient portal Overview My Consultations Book New Consultation Health Metrics Saved Articles My Questions Doctor Responses My Profile Settings /dashboard/patient",
      ),
      doctorDash: getSectionSearchText(
        "Doctor Dashboard Physician portal Overview My Patients Consultations Patient Q&A Prescriptions Submit Article My Articles Earnings Reviews Ratings My Profile /dashboard/doctor",
      ),
      admin: getSectionSearchText(
        "Admin Panel Platform management Admin Dashboard Users Doctors Patients Roles Appointments Consultation Requests Prescriptions Blog Posts Categories Tags Comments Authors Review Queue Email Templates OTP Templates Notifications Homepage Sections Health Tools FAQs Contact Inquiries SEO Settings Traffic Analytics Consultation Analytics Revenue Analytics /admin",
      ),
      utility: getSectionSearchText(
        "Utility Pages System error 404 Error Page Sitemap HTML /404 /sitemap",
      ),
    }),
    [],
  );

  const sectionVisibility = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const sections: Record<string, boolean> = {};

    Object.entries(sectionSearchTexts).forEach(([id, text]) => {
      const cat =
        id === "core" || id === "doctors" || id === "utility"
          ? "public"
          : id === "content"
            ? "content"
            : id === "editorial"
              ? "editorial"
              : id === "legal"
                ? "legal"
                : id === "auth"
                  ? "auth"
                  : "dashboard";

      const catMatch = activeCat === "all" || activeCat === cat;
      const textMatch = q === "" || text.includes(q);
      sections[id] = catMatch && textMatch;
    });

    return sections;
  }, [activeCat, searchQuery, sectionSearchTexts]);

  const visibleCount = useMemo(
    () => Object.values(sectionVisibility).filter(Boolean).length,
    [sectionVisibility],
  );

  const isFiltered = activeCat !== "all" || searchQuery.trim() !== "";
  const showNoResults = visibleCount === 0;

  const coreItems: SmItemData[] = [
    { href: "/", priority: "high", dotColor: "var(--green)", title: "🏠 Home", url: "/", tags: [{ type: "done", label: "✓ Live" }] },
    { href: "/about", priority: "high", dotColor: "var(--green)", title: "ℹ️ About Us", url: "/about", tags: [{ type: "done", label: "✓ Live" }] },
    { href: "/contact", priority: "high", dotColor: "var(--green)", title: "📞 Contact Us", url: "/contact", tags: [{ type: "done", label: "✓ Live" }] },
    { href: "/faq", priority: "med", dotColor: "var(--green)", title: "❓ FAQ", url: "/faq", tags: [{ type: "done", label: "✓ Live" }] },
    { href: "/health-tools", priority: "high", dotColor: "var(--green)", title: "🔧 Health Tools", url: "/health-tools", tags: [{ type: "done", label: "✓ Live" }] },
    { href: "/ask-doctor", priority: "high", dotColor: "var(--green)", title: "💬 Ask the Doctor", url: "/ask-the-doctor", tags: [{ type: "done", label: "✓ Live" }] },
    { href: "/book-consultation", priority: "high", dotColor: "var(--green)", title: "📅 Book Consultation", url: "/book-consultation", tags: [{ type: "done", label: "✓ Live" }] },
  ];

  const doctorDirItems: SmItemData[] = [
    { href: "/doctors", priority: "high", dotColor: "var(--green)", title: "👥 Doctors Directory", url: "/doctors", tags: [{ type: "done", label: "✓ Live" }] },
    { href: "/doctors", priority: "high", dotColor: "var(--amber)", title: "👤 Doctor Profile / Bio", url: "/doctors/dr-[name]-[specialty]", tags: [{ type: "dynamic", label: "Dynamic" }] },
    { href: "/book-consultation", priority: "med", dotColor: "var(--green)", title: "📅 Book with a Doctor", url: "/book-consultation?doctor=[slug]", tags: [{ type: "dynamic", label: "Dynamic" }] },
  ];

  const contentItems: SmItemData[] = [
    { href: "/blog", priority: "high", dotColor: "var(--green)", title: "📰 Blog Listing", url: "/blog", tags: [{ type: "done", label: "✓ Live" }] },
    { href: "/blog", priority: "high", dotColor: "var(--amber)", title: "📄 Single Article", url: "/articles/[specialty]/[slug]", tags: [{ type: "dynamic", label: "Dynamic · 600+ pages" }] },
    { href: "/doctors", priority: "med", dotColor: "var(--amber)", title: "🖊️ Author Bio Page", url: "/authors/[author-slug]", tags: [{ type: "dynamic", label: "Dynamic" }] },
  ];

  const editorialItems: SmItemData[] = [
    { href: "/editorial-policy", priority: "high", dotColor: "var(--green)", title: "📜 Editorial Policy", url: "/editorial-policy", tags: [{ type: "done", label: "✓ Live" }] },
    { href: "/editorial-policy", priority: "high", dotColor: "var(--green)", title: "🔬 Medical Review Process", url: "/editorial-policy", tags: [{ type: "done", label: "✓ Live" }] },
    { href: "/author-guidelines", priority: "high", dotColor: "var(--green)", title: "✍️ Author Guidelines", url: "/author-guidelines", tags: [{ type: "done", label: "✓ Live" }] },
  ];

  const legalItems: SmItemData[] = [
    { href: "/privacy-policy", priority: "high", dotColor: "var(--green)", title: "🛡️ Privacy Policy", url: "/privacy-policy", tags: [{ type: "done", label: "✓ Live" }] },
    { href: "/terms-conditions", priority: "high", dotColor: "var(--green)", title: "📃 Terms & Conditions", url: "/terms-and-conditions", tags: [{ type: "done", label: "✓ Live" }] },
    { href: "/disclaimer", priority: "high", dotColor: "var(--green)", title: "⚠️ Medical Disclaimer", url: "/disclaimer", tags: [{ type: "done", label: "✓ Live" }] },
    { href: "/cookie-policy", priority: "med", dotColor: "var(--green)", title: "🍪 Cookie Policy", url: "/cookie-policy", tags: [{ type: "done", label: "✓ Live" }] },
  ];

  const authItems: SmItemData[] = [
    { href: "/login", priority: "high", dotColor: "var(--green)", title: "🔑 Login", url: "/login", tags: [{ type: "auth", label: "Auth Required" }] },
    { href: "/register", priority: "high", dotColor: "var(--green)", title: "✨ Register", url: "/register", tags: [{ type: "done", label: "✓ Live" }] },
    { href: "/forgot-password", priority: "med", dotColor: "var(--green)", title: "🔓 Forgot Password", url: "/forgot-password", tags: [{ type: "done", label: "✓ Live" }] },
    { href: "/reset-password", priority: "med", dotColor: "var(--green)", title: "🔐 Reset Password", url: "/reset-password", tags: [{ type: "done", label: "✓ Live" }] },
  ];

  const patientItems: SmItemData[] = [
    { href: "/patient", priority: "high", dotColor: "var(--green)", title: "📊 Overview", url: "/dashboard/patient", tags: [{ type: "auth", label: "Auth · Patient" }] },
    { href: "/patient/consultations", dotColor: "var(--blue)", title: "📅 My Consultations", url: "/dashboard/patient/consultations", tags: [{ type: "auth", label: "Auth" }] },
    { href: "/book-consultation", dotColor: "var(--blue)", title: "📅 Book New Consultation", url: "/dashboard/patient/book", tags: [{ type: "auth", label: "Auth" }] },
    { href: "/patient/health", dotColor: "var(--blue)", title: "💪 Health Metrics", url: "/dashboard/patient/health-metrics", tags: [{ type: "auth", label: "Auth" }] },
    { href: "/patient/articles", dotColor: "var(--blue)", title: "🔖 Saved Articles", url: "/dashboard/patient/saved-articles", tags: [{ type: "auth", label: "Auth" }] },
    { href: "/patient/questions", dotColor: "var(--blue)", title: "❓ My Questions", url: "/dashboard/patient/questions", tags: [{ type: "auth", label: "Auth" }] },
    { href: "/patient/questions", dotColor: "var(--blue)", title: "💬 Doctor Responses", url: "/dashboard/patient/doctor-responses", tags: [{ type: "auth", label: "Auth" }] },
    { href: "/patient/profile", dotColor: "var(--blue)", title: "👤 My Profile", url: "/dashboard/patient/profile", tags: [{ type: "auth", label: "Auth" }] },
    { href: "/patient/settings", dotColor: "var(--blue)", title: "⚙️ Settings", url: "/dashboard/patient/settings", tags: [{ type: "auth", label: "Auth" }] },
  ];

  const doctorDashItems: SmItemData[] = [
    { href: "/doctor", priority: "high", dotColor: "var(--green)", title: "📊 Overview", url: "/dashboard/doctor", tags: [{ type: "auth", label: "Auth · Doctor" }] },
    { href: "/doctor/patients", dotColor: "var(--blue)", title: "👥 My Patients", url: "/dashboard/doctor/patients", tags: [{ type: "auth", label: "Auth" }] },
    { href: "/doctor/appointments", dotColor: "var(--blue)", title: "📅 Consultations", url: "/dashboard/doctor/consultations", tags: [{ type: "auth", label: "Auth" }] },
    { href: "/doctor/questions", dotColor: "var(--blue)", title: "💬 Patient Q&A", url: "/dashboard/doctor/qa", tags: [{ type: "auth", label: "Auth" }] },
    { href: "/doctor/prescriptions", dotColor: "var(--blue)", title: "💊 Prescriptions", url: "/dashboard/doctor/prescriptions", tags: [{ type: "auth", label: "Auth" }] },
    { href: "/doctor/submit-article", dotColor: "var(--blue)", title: "✍️ Submit Article", url: "/dashboard/doctor/submit-article", tags: [{ type: "auth", label: "Auth" }] },
    { href: "/doctor/articles", dotColor: "var(--blue)", title: "📰 My Articles", url: "/dashboard/doctor/my-articles", tags: [{ type: "auth", label: "Auth" }] },
    { href: "/doctor/earnings", dotColor: "var(--blue)", title: "💰 Earnings", url: "/dashboard/doctor/earnings", tags: [{ type: "auth", label: "Auth" }] },
    { href: "/doctor/reviews", dotColor: "var(--blue)", title: "⭐ Reviews & Ratings", url: "/dashboard/doctor/reviews", tags: [{ type: "auth", label: "Auth" }] },
    { href: "/doctor/profile", dotColor: "var(--blue)", title: "👤 My Profile", url: "/dashboard/doctor/profile", tags: [{ type: "auth", label: "Auth" }] },
  ];

  const utilityItems: SmItemData[] = [
    { href: "#", priority: "high", dotColor: "var(--green)", title: "🔍 404 Error Page", url: "/404", tags: [{ type: "done", label: "✓ Live" }] },
    { href: "/sitemap", priority: "high", dotColor: "var(--green)", title: "🗺️ Sitemap (HTML)", url: "/sitemap", tags: [{ type: "done", label: "✓ Live" }] },
  ];

  const sectionStyle = (id: keyof typeof sectionSearchTexts) =>
    sectionVisibility[id] ? undefined : { display: "none" as const };

  return (
    <div className="sitemap-page">
      <div className="breadcrumb">
        <div className="breadcrumb-inner">
          <Link href="/">🏠 Home</Link>
          <span>›</span>
          <span className="current">Sitemap</span>
        </div>
      </div>

      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-eyebrow">🗺️ SITE NAVIGATION</div>
          <h1>
            MedAuthority <span>Sitemap</span>
          </h1>
          <p>
            A complete directory of every page on MedAuthority — from health articles and doctor profiles to
            dashboards and legal policies.
          </p>
          <div className="hero-stats">
            <div className="hs">
              <strong>26</strong>
              <span>Total Pages</span>
            </div>
            <div className="hs">
              <strong>600+</strong>
              <span>Articles</span>
            </div>
            <div className="hs">
              <strong>8</strong>
              <span>Specialties</span>
            </div>
            <div className="hs">
              <strong>7</strong>
              <span>Doctor Profiles</span>
            </div>
          </div>
        </div>
      </div>

      <div className="search-bar-wrap">
        <div className="search-bar-inner">
          <div className="sm-search">
            <input
              type="text"
              id="smSearch"
              placeholder="Search pages by name or URL..."
              value={searchQuery}
              onChange={(e) => filterSitemap(e.target.value)}
            />
          </div>
          <div className="sm-filter">
            {FILTERS.map(({ cat, label }) => (
              <button
                key={cat}
                type="button"
                className={`sf${activeCat === cat ? " on" : ""}`}
                data-cat={cat}
                onClick={() => setCat(cat)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="sm-count" id="smCount">
            {isFiltered ? (
              <>
                Showing <strong>{visibleCount}</strong> section(s)
              </>
            ) : (
              <>
                Showing <strong>26</strong> of <strong>26</strong> pages
              </>
            )}
          </div>
        </div>
      </div>

      <div className="sitemap-main">
        <div className="last-updated-row">
          <div className="lu-left">
            <div className="lu-dot" />
            <span>
              Sitemap last updated: <strong>June 14, 2026</strong> · All 26 pages live · Version 2.0
            </span>
          </div>
          <div className="lu-right">
            <button
              type="button"
              className="lu-btn"
              onClick={() => showToast("XML sitemap: medauthority.com/sitemap.xml")}
            >
              📄 XML Sitemap
            </button>
            <button
              type="button"
              className="lu-btn"
              onClick={() => showToast("Robots.txt: medauthority.com/robots.txt")}
            >
              🤖 robots.txt
            </button>
            <button type="button" className="lu-btn primary" onClick={() => window.print()}>
              🖨️ Print Sitemap
            </button>
          </div>
        </div>

        <div className="sitemap-grid" id="smGrid">
          <div className="sm-section" data-cat="public" style={sectionStyle("core")}>
            <div className="sm-section-hd">
              <div className="sm-hd-icon" style={{ background: "var(--blue-light)" }}>
                🏠
              </div>
              <div>
                <h3>Core Pages</h3>
                <span>Main public-facing pages</span>
              </div>
              <div className="sm-count-badge">7 pages</div>
            </div>
            <SmList items={coreItems} />
          </div>

          <div className="sm-section" data-cat="public" style={sectionStyle("doctors")}>
            <div className="sm-section-hd">
              <div className="sm-hd-icon" style={{ background: "#f0fdf4" }}>
                👨‍⚕️
              </div>
              <div>
                <h3>Doctor Directory</h3>
                <span>Find & book specialists</span>
              </div>
              <div className="sm-count-badge">3 pages</div>
            </div>
            <SmList items={doctorDirItems} />
            <div className="sm-subsection">
              <div className="sm-subsection-label">Featured Doctors ({featuredDoctors.length})</div>
              <div className="sm-pill-row">
                {featuredDoctors.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/doctors/${doc.id}`}
                    className="sm-pill"
                  >
                    {doctorFullName(doc.user)}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="sm-section" data-cat="content" style={sectionStyle("content")}>
            <div className="sm-section-hd">
              <div className="sm-hd-icon" style={{ background: "#eff6ff" }}>
                📰
              </div>
              <div>
                <h3>Content Pages</h3>
                <span>Articles, blog & authors</span>
              </div>
              <div className="sm-count-badge">3 pages</div>
            </div>
            <SmList items={contentItems} />
            <div className="sm-subsection">
              <div className="sm-subsection-label">Article Categories</div>
              <div className="sm-pill-row">
                {articleCategories.map((cat, i) => (
                  <Link
                    key={cat.slug}
                    href={`/blog?category=${cat.slug}`}
                    className="sm-cat-pill"
                    style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length], color: "var(--blue-dark)" }}
                  >
                    {specialtyEmoji(cat.name)} {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="sm-section" data-cat="editorial" style={sectionStyle("editorial")}>
            <div className="sm-section-hd">
              <div className="sm-hd-icon" style={{ background: "#fef9c3" }}>
                📋
              </div>
              <div>
                <h3>Editorial & Trust</h3>
                <span>Standards & transparency</span>
              </div>
              <div className="sm-count-badge">3 pages</div>
            </div>
            <SmList items={editorialItems} />
          </div>

          <div className="sm-section" data-cat="legal" style={sectionStyle("legal")}>
            <div className="sm-section-hd">
              <div className="sm-hd-icon" style={{ background: "#f0fdf4" }}>
                ⚖️
              </div>
              <div>
                <h3>Legal & Policy</h3>
                <span>Privacy, terms & compliance</span>
              </div>
              <div className="sm-count-badge">4 pages</div>
            </div>
            <SmList items={legalItems} />
          </div>

          <div className="sm-section" data-cat="auth" style={sectionStyle("auth")}>
            <div className="sm-section-hd">
              <div className="sm-hd-icon" style={{ background: "#fef2f2" }}>
                🔐
              </div>
              <div>
                <h3>Authentication</h3>
                <span>Login, register & reset</span>
              </div>
              <div className="sm-count-badge">4 pages</div>
            </div>
            <SmList items={authItems} />
          </div>

          <div className="sm-section" data-cat="dashboard" style={sectionStyle("patient")}>
            <div className="sm-section-hd">
              <div className="sm-hd-icon" style={{ background: "#ecfdf5" }}>
                🏥
              </div>
              <div>
                <h3>Patient Dashboard</h3>
                <span>Logged-in patient portal</span>
              </div>
              <div className="sm-count-badge">10 tabs</div>
            </div>
            <SmList items={patientItems} />
          </div>

          <div className="sm-section" data-cat="dashboard" style={sectionStyle("doctorDash")}>
            <div className="sm-section-hd">
              <div className="sm-hd-icon" style={{ background: "#eff6ff" }}>
                👨‍⚕️
              </div>
              <div>
                <h3>Doctor Dashboard</h3>
                <span>Physician portal sections</span>
              </div>
              <div className="sm-count-badge">13 tabs</div>
            </div>
            <SmList items={doctorDashItems} />
          </div>

          <div className="sm-section" data-cat="dashboard" style={sectionStyle("admin")}>
            <div className="sm-section-hd">
              <div className="sm-hd-icon" style={{ background: "#f5f3ff" }}>
                🛡️
              </div>
              <div>
                <h3>Admin Panel</h3>
                <span>Platform management</span>
              </div>
              <div className="sm-count-badge">27 sections</div>
            </div>
            <div className="sm-list">
              <Link href="/admin" className="sm-item priority-high">
                <div className="sm-item-dot" style={{ background: "var(--green)" }} />
                <div className="sm-item-info">
                  <span className="sm-item-title">📊 Admin Dashboard</span>
                  <span className="sm-item-url">/admin</span>
                  <div className="sm-item-meta">
                    <span className="sm-tag tag-auth">Auth · Admin Only</span>
                  </div>
                </div>
                <div className="sm-arrow">→</div>
              </Link>
              <div className="sm-subsection" style={{ borderBottom: "1px solid var(--gray-100)" }}>
                <div className="sm-subsection-label" style={{ marginBottom: 8 }}>
                  All 27 Admin Sections
                </div>
                <div className="sm-pill-row" style={{ gap: 5 }}>
                  {ADMIN_TAGS.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: "0.7rem",
                        padding: "2px 8px",
                        borderRadius: "50px",
                        background: "var(--blue-light)",
                        color: "var(--blue)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="sm-section" data-cat="public" style={sectionStyle("utility")}>
            <div className="sm-section-hd">
              <div className="sm-hd-icon" style={{ background: "#f0fdff" }}>
                🛠️
              </div>
              <div>
                <h3>Utility Pages</h3>
                <span>System & error pages</span>
              </div>
              <div className="sm-count-badge">2 pages</div>
            </div>
            <SmList items={utilityItems} />
          </div>

          <div className={`no-results${showNoResults ? " show" : ""}`} id="noResults">
            <div className="nr-ico">🔍</div>
            <h3>No pages found</h3>
            <p>Try adjusting your search term or filter selection.</p>
          </div>
        </div>

        <div className="xml-cta">
          <div className="xml-cta-left">
            <h3>🤖 Looking for the XML Sitemap?</h3>
            <p>
              Our machine-readable XML sitemap is available for search engines and SEO tools. It includes all 26 public
              pages with last-modified dates and priority scores.
            </p>
          </div>
          <div className="xml-cta-btns">
            <button
              type="button"
              className="xml-btn primary"
              onClick={() => showToast("Opening XML sitemap: medauthority.com/sitemap.xml")}
            >
              📄 View XML Sitemap
            </button>
            <button
              type="button"
              className="xml-btn outline"
              onClick={() => showToast("robots.txt: medauthority.com/robots.txt")}
            >
              🤖 robots.txt
            </button>
          </div>
        </div>

        <div className="section-heading">
          <h2>📰 Article Categories</h2>
          <span className="sh-badge">600+ articles</span>
        </div>
        <div className="specialty-grid">
          {specialtyCards.map(({ icon, name, count, url }) => (
            <Link key={name} href="/blog" className="spec-card">
              <div className="spec-icon">{icon}</div>
              <div className="spec-name">{name}</div>
              <div className="spec-count">{count}</div>
              <div className="spec-url">{url}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className={`toast${toastVisible ? " show" : ""}`} id="toastMsg">
        {toastMsg}
      </div>
    </div>
  );
}
