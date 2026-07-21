"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import "@/styles/research-publications.css";
import { formatDate } from "@/lib/data-mappers";
import { formatNumber } from "@/lib/admin-utils";
import {
  type Publication,
  type PublicationType,
  PUBLICATION_TYPE_LABELS,
  publicationAuthorsLine,
  publicationCoverUrl,
  publicationPdfUrl,
  useFeaturedPublications,
  useLatestPublications,
  usePopularPublications,
  usePublicPublicationStats,
  usePublicPublications,
  useTogglePublicationBookmark,
  useTrackPublicationDownload,
  useTrackPublicationShare,
} from "@/services/publications-api-hooks";
import { useAuthStore } from "@/store/auth.store";

const TOC = [
  { id: "s1", num: "1", label: "Research Overview" },
  { id: "s2", num: "2", label: "Focus Areas" },
  { id: "s3", num: "3", label: "Featured Publications" },
  { id: "s4", num: "4", label: "Our Methodology" },
  { id: "s5", num: "5", label: "Evidence Standards" },
  { id: "s6", num: "6", label: "Peer Review & Ethics" },
  { id: "s7", num: "7", label: "Publication Types" },
  { id: "s8", num: "8", label: "Data & Transparency" },
  { id: "s9", num: "9", label: "How to Cite Us" },
  { id: "s10", num: "10", label: "Partners" },
  { id: "s11", num: "11", label: "Submit / Collaborate" },
  { id: "s12", num: "12", label: "Research Team" },
  { id: "s13", num: "13", label: "Contact" },
];

const FOCUS_AREAS = [
  { icon: "❤️", title: "Cardiovascular", text: "Hypertension, heart failure, lipid management and prevention." },
  { icon: "🧠", title: "Neurology", text: "Stroke, migraine, epilepsy and neurodegenerative disease." },
  { icon: "🩺", title: "Endocrine & Metabolic", text: "Diabetes, thyroid disorders and obesity medicine." },
  { icon: "🧬", title: "Oncology", text: "Screening, early detection and survivorship care." },
  { icon: "👶", title: "Pediatrics", text: "Child development, vaccination and common childhood illness." },
  { icon: "🧘", title: "Mental Health", text: "Anxiety, depression and evidence-based psychotherapy." },
  { icon: "🌿", title: "Preventive Health", text: "Nutrition, lifestyle medicine and risk reduction." },
  { icon: "🦠", title: "Infectious Disease", text: "Immunisation, antimicrobial stewardship and outbreaks." },
  { icon: "🦷", title: "Dental & Oral Health", text: "Preventive dentistry and oral-systemic health links." },
];

const TYPE_TAG_CLASS: Partial<Record<PublicationType, string>> = {
  JOURNAL_ARTICLE: "tag-review",
  RESEARCH_PAPER: "tag-meta",
  CASE_STUDY: "tag-clin",
  CLINICAL_TRIAL: "tag-meta",
  REVIEW_ARTICLE: "tag-review",
  CONFERENCE_PAPER: "tag-guide",
  BOOK_CHAPTER: "tag-clin",
  THESIS: "tag-default",
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "views", label: "Most Viewed" },
  { value: "downloads", label: "Most Downloaded" },
  { value: "citations", label: "Most Cited" },
] as const;

function doctorLine(pub: Publication): string {
  const user = pub.doctor?.user;
  if (user) return `Dr. ${user.firstName} ${user.lastName}`;
  return publicationAuthorsLine(pub);
}

function pubDate(pub: Publication): string {
  const raw = pub.publicationDate ?? pub.publishedAt ?? pub.createdAt;
  return raw ? formatDate(raw, { month: "short", year: "numeric" }) : "—";
}

function Accordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`acc${open ? " open" : ""}`}>
      <button type="button" className="acc-h" onClick={onToggle} aria-expanded={open}>
        <h4>{title}</h4>
        <div className="acc-chev">▼</div>
      </button>
      <div className="acc-b">{children}</div>
    </div>
  );
}

function PublicationCard({
  pub,
  compact,
  isLoggedIn,
  onBookmark,
}: {
  pub: Publication;
  compact?: boolean;
  isLoggedIn: boolean;
  onBookmark: (pub: Publication) => void;
}) {
  const router = useRouter();
  const cover = publicationCoverUrl(pub);
  const pdf = publicationPdfUrl(pub);
  const doiLink = pub.doiUrl ?? (pub.doi ? `https://doi.org/${pub.doi}` : null);
  const trackDownload = useTrackPublicationDownload();
  const trackShare = useTrackPublicationShare();
  const detailHref = `/research-publications/${pub.slug}`;

  const handleRead = () => {
    router.push(detailHref);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!pdf) return;
    window.open(pdf, "_blank", "noopener,noreferrer");
    trackDownload.mutate(pub.slug);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}${detailHref}`;
    trackShare.mutate(pub.slug);
    if (navigator.share) {
      await navigator.share({ title: pub.title, text: pub.abstract.slice(0, 120), url });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard");
    }
  };

  return (
    <article className={`pub-card${compact ? " compact" : ""}`} id={pub.slug}>
      {!compact ? (
        <Link href={detailHref} className="pub-cover-link">
          {cover ? (
            <img src={cover} alt="" className="pub-cover" />
          ) : (
            <div className="pub-cover-placeholder">📄</div>
          )}
        </Link>
      ) : null}
      <div>
        <div className="pub-top">
          <span className={`pub-tag ${TYPE_TAG_CLASS[pub.publicationType] ?? "tag-default"}`}>
            {PUBLICATION_TYPE_LABELS[pub.publicationType]}
          </span>
          {pub.physicianReviewed ? <span className="reviewed-badge">✔ Physician-Reviewed</span> : null}
          <span className="pub-date">{pubDate(pub)}</span>
        </div>
        <h4>
          <Link href={detailHref}>{pub.title}</Link>
        </h4>
        <div className="pub-authors">
          <em>{publicationAuthorsLine(pub)}</em>
          {pub.reviewingPhysician ? ` · Reviewed by ${pub.reviewingPhysician}` : null}
        </div>
        <div className="pub-meta-row">
          {pub.medicalSpecialty ? <span>🏥 {pub.medicalSpecialty}</span> : null}
          {pub.journalName ? <span>📰 {pub.journalName}</span> : null}
          {pub.doi ? <span>🔗 DOI: {pub.doi}</span> : null}
        </div>
        <p className="pub-abstract">{pub.abstract}</p>
        {pub.keywords?.length ? (
          <div className="pub-keywords">
            {pub.keywords.map((kw) => (
              <span key={kw.id ?? kw.keyword} className="pub-kw">
                {kw.keyword}
              </span>
            ))}
          </div>
        ) : null}
        <div className="pub-foot">
          {pub.referenceCount ? <span className="pf-stat">📚 {pub.referenceCount} references</span> : null}
          <span className="pf-stat">⏱️ {pub.readTimeMinutes} min read</span>
          <span className="pf-stat">👁 {formatNumber(pub.viewCount)} views</span>
          <span className="pf-stat">⬇ {formatNumber(pub.downloadCount)} downloads</span>
          <span className="pf-stat">📎 {formatNumber(pub.citationCount)} citations</span>
          {pub.openAccess ? <span className="pf-stat">🔓 Open access</span> : null}
        </div>
        <div className="pub-actions">
          <button type="button" className="pub-btn primary" onClick={handleRead}>
            Read Publication
          </button>
          {pdf ? (
            <button type="button" className="pub-btn" onClick={handleDownload}>
              Download PDF
            </button>
          ) : null}
          {doiLink ? (
            <a
              href={doiLink}
              className="pub-btn"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              View DOI
            </a>
          ) : null}
          <button type="button" className="pub-btn" onClick={handleShare}>
            Share
          </button>
          {isLoggedIn ? (
            <button
              type="button"
              className={`pub-btn${pub.bookmarked ? " bookmarked" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onBookmark(pub);
              }}
            >
              {pub.bookmarked ? "★ Bookmarked" : "☆ Bookmark"}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function ResearchPublicationsPageContent() {
  const isLoggedIn = useAuthStore((s) => s.isAuthenticated);
  const [activeSection, setActiveSection] = useState("s1");
  const [accordions, setAccordions] = useState<Record<string, boolean>>({ "pub-type-0": true });
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [pubType, setPubType] = useState("");
  const [year, setYear] = useState("");
  const [journal, setJournal] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]["value"]>("newest");
  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<Publication[]>([]);

  const statsQuery = usePublicPublicationStats();
  const featuredQuery = useFeaturedPublications(5);
  const latestQuery = useLatestPublications(5);
  const popularQuery = usePopularPublications(5);
  const bookmarkMutation = useTogglePublicationBookmark();

  const browseQuery = usePublicPublications({
    page,
    limit: 12,
    search: search.trim() || undefined,
    specialty: specialty || undefined,
    publicationType: (pubType as PublicationType) || undefined,
    year: year ? Number(year) : undefined,
    journal: journal || undefined,
    doctorId: doctorId || undefined,
    sort,
  });

  const stats = statsQuery.data;
  const browseMeta = browseQuery.data?.meta;

  useEffect(() => {
    if (!browseQuery.data) return;
    const data = browseQuery.data.data ?? [];
    setAllItems((prev) => (page === 1 ? data : [...prev, ...data]));
  }, [browseQuery.data, page]);

  const filterOptions = useMemo(() => {
    const pubs = [...(featuredQuery.data ?? []), ...(latestQuery.data ?? []), ...allItems];
    const specialties = [...new Set(pubs.map((p) => p.medicalSpecialty).filter(Boolean))] as string[];
    const journals = [...new Set(pubs.map((p) => p.journalName).filter(Boolean))] as string[];
    const years = [
      ...new Set(
        pubs
          .map((p) => {
            const d = p.publicationDate ?? p.publishedAt;
            return d ? new Date(d).getFullYear() : null;
          })
          .filter((y): y is number => y !== null),
      ),
    ].sort((a, b) => b - a);
    const doctors = pubs
      .filter((p) => p.doctor?.id)
      .map((p) => ({
        id: p.doctor!.id,
        name: doctorLine(p),
      }));
    const uniqueDoctors = [...new Map(doctors.map((d) => [d.id, d])).values()];
    return { specialties, journals, years, doctors: uniqueDoctors };
  }, [featuredQuery.data, latestQuery.data, allItems]);

  const sectionIds = TOC.map((t) => t.id);

  useEffect(() => {
    const onScroll = () => {
      let active = "s1";
      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 120) active = id;
      });
      setActiveSection(active);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [sectionIds]);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const resetFilters = () => {
    setSearch("");
    setSpecialty("");
    setPubType("");
    setYear("");
    setJournal("");
    setDoctorId("");
    setSort("newest");
    setPage(1);
  };

  const applyFilters = () => {
    setPage(1);
    setAllItems([]);
  };

  const handleBookmark = async (pub: Publication) => {
    try {
      await bookmarkMutation.mutateAsync(pub.slug);
    } catch {
      alert("Failed to update bookmark");
    }
  };

  const copyCite = async (text: string) => {
    await navigator.clipboard.writeText(text);
    alert("Citation copied");
  };

  const hasMore = browseMeta ? page < browseMeta.totalPages : false;

  return (
    <div className="research-pub-page">

      <div className="page-hero">
        <div className="hero-inner">
          <h1>🔬 Research &amp; Publications</h1>
          <p>
            &quot;The evidence behind every article we publish — our research focus areas, peer-reviewed studies,
            methodology, and how you can read, cite, or collaborate with us.&quot;
          </p>
          <div className="hero-meta">
            <span>📅 Established: 2022</span>
            <span>🔄 Last Updated: July 1, 2026</span>
            <span>📚 Repository Version 3.0</span>
          </div>
          <div className="hero-actions">
            <button type="button" className="hero-btn primary" onClick={() => scrollTo("s3")}>
              📖 Browse Publications
            </button>
            <button type="button" className="hero-btn" onClick={() => scrollTo("s11")}>
              🤝 Collaborate With Us
            </button>
          </div>
          <div className="trust-strip">
            {["✅ Physician-Reviewed", "🧬 Evidence-Based", "🔓 Open Access", "📋 Full COI Disclosure", "🔗 Fully Referenced"].map(
              (pill) => (
                <div key={pill} className="trust-pill">
                  {pill}
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="metric-strip">
        <div className="metric-inner">
          <div>
            <div className="m-num">
              {statsQuery.isLoading ? "—" : `${formatNumber(stats?.publicationCount ?? 0)}+`}
            </div>
            <div className="m-lab">Peer-Reviewed Articles</div>
          </div>
          <div>
            <div className="m-num">{statsQuery.isLoading ? "—" : formatNumber(stats?.doctorCount ?? 0)}</div>
            <div className="m-lab">Contributing Specialists</div>
          </div>
          <div>
            <div className="m-num">{statsQuery.isLoading ? "—" : formatNumber(stats?.specialtyCount ?? 0)}</div>
            <div className="m-lab">Focus Areas</div>
          </div>
          <div>
            <div className="m-num">
              {statsQuery.isLoading ? "—" : `${stats?.sourcesCitedPercent ?? 100}%`}
            </div>
            <div className="m-lab">Sources Cited</div>
          </div>
        </div>
      </div>

      <div className="mission-box">
        <div className="mission-inner">
          <h2>🎯 Our Research Commitment</h2>
          <p>
            DrInsight is not a primary research laboratory — we are a medical publisher committed to translating the best
            available scientific evidence into content patients and clinicians can trust. Every review, evidence summary,
            and clinical explainer we publish is grounded in peer-reviewed literature, screened against strict evidence
            standards, and reviewed by qualified physicians before it reaches you.
          </p>
        </div>
      </div>

      <div className="main-wrap">
        <aside className="toc-sidebar">
          <div className="toc-head">📑 On This Page</div>
          <div className="toc-list">
            {TOC.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`toc-item${activeSection === item.id ? " active" : ""}`}
                onClick={() => scrollTo(item.id)}
              >
                <div className="toc-num">{item.num}</div>
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        <div>
          <section className="section" id="s1">
            <div className="sec-title">
              <div className="sn">1</div>Research Overview
            </div>
            <div className="prose">
              <p>
                Our editorial research program exists to answer one question for every article:{" "}
                <strong>&quot;What does the best current evidence actually say?&quot;</strong> We systematically monitor
                peer-reviewed medical literature, clinical practice guidelines, and authoritative public-health sources.
              </p>
            </div>
            <div className="box box-b">
              <div className="bh">🔑 What Makes Our Work Different</div>
              <ul>
                <li>Every clinical claim is traceable to a cited, peer-reviewed source.</li>
                <li>All content is signed off by a licensed physician before publication.</li>
                <li>We disclose funding, conflicts of interest, and AI assistance openly.</li>
              </ul>
            </div>
          </section>

          <section className="section t" id="s2">
            <div className="sec-title">
              <div className="sn t">2</div>Research Focus Areas
            </div>
            <div className="phil-grid">
              {FOCUS_AREAS.map((area) => (
                <div key={area.title} className="phil-card">
                  <div className="phil-ico">{area.icon}</div>
                  <h4>{area.title}</h4>
                  <p>{area.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="section p" id="s3">
            <div className="sec-title">
              <div className="sn p">3</div>Featured Publications
            </div>
            <div className="prose">
              <p>Browse featured, latest, and popular publications. Use filters to search the full library.</p>
            </div>

            <div className="pub-section-label">⭐ Featured</div>
            <div className="pub-list">
              {featuredQuery.isLoading ? (
                <div className="empty-pubs">Loading featured publications...</div>
              ) : (featuredQuery.data ?? []).length === 0 ? (
                <div className="empty-pubs">No featured publications yet.</div>
              ) : (
                (featuredQuery.data ?? []).map((pub) => (
                  <PublicationCard key={pub.id} pub={pub} isLoggedIn={isLoggedIn} onBookmark={handleBookmark} />
                ))
              )}
            </div>

            <div className="pub-section-label">🆕 Latest</div>
            <div className="pub-list">
              {(latestQuery.data ?? []).map((pub) => (
                <PublicationCard key={pub.id} pub={pub} compact isLoggedIn={isLoggedIn} onBookmark={handleBookmark} />
              ))}
            </div>

            <div className="pub-section-label">🔥 Popular</div>
            <div className="pub-list">
              {(popularQuery.data ?? []).map((pub) => (
                <PublicationCard key={pub.id} pub={pub} compact isLoggedIn={isLoggedIn} onBookmark={handleBookmark} />
              ))}
            </div>

            <div className="pub-section-label">🔍 Search Library</div>
            <div className="pub-search-bar">
              <input
                type="search"
                placeholder="Search title, abstract, DOI, keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              />
              <select value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
                <option value="">All specialties</option>
                {filterOptions.specialties.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select value={pubType} onChange={(e) => setPubType(e.target.value)}>
                <option value="">All types</option>
                {Object.entries(PUBLICATION_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">All years</option>
                {filterOptions.years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <select value={journal} onChange={(e) => setJournal(e.target.value)}>
                <option value="">All journals</option>
                {filterOptions.journals.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
              <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
                <option value="">All doctors</option>
                {filterOptions.doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="pub-controls">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`pub-filter${sort === opt.value ? " active" : ""}`}
                  onClick={() => {
                    setSort(opt.value);
                    setPage(1);
                    setAllItems([]);
                  }}
                >
                  {opt.label}
                </button>
              ))}
              <button type="button" className="pub-filter" onClick={applyFilters}>
                Apply Filters
              </button>
              <button type="button" className="pub-filter" onClick={resetFilters}>
                Reset
              </button>
            </div>

            <div className="pub-list">
              {browseQuery.isLoading && page === 1 ? (
                <div className="empty-pubs">Loading publications...</div>
              ) : allItems.length === 0 ? (
                <div className="empty-pubs">No publications match your filters.</div>
              ) : (
                allItems.map((pub) => (
                  <PublicationCard key={pub.id} pub={pub} isLoggedIn={isLoggedIn} onBookmark={handleBookmark} />
                ))
              )}
            </div>
            {hasMore ? (
              <div className="load-more-wrap">
                <button
                  type="button"
                  className="load-more-btn"
                  disabled={browseQuery.isFetching}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {browseQuery.isFetching ? "Loading..." : "Load More"}
                </button>
              </div>
            ) : null}
          </section>

          <section className="section" id="s4">
            <div className="sec-title">
              <div className="sn">4</div>Our Research Methodology
            </div>
            <div className="prose">
              <p>Every publication moves through the same four-stage pipeline before it goes live:</p>
            </div>
            <div className="proc-wrap">
              <div className="proc-row">
                {[
                  { icon: "🔍", title: "1. Evidence Gathering", text: "Search peer-reviewed databases & guidelines" },
                  { icon: "✍️", title: "2. Expert Authoring", text: "Drafted by a qualified clinician" },
                  { icon: "🩺", title: "3. Physician Review", text: "Independent medical fact-check" },
                  { icon: "🔄", title: "4. Publish & Monitor", text: "Dated, cited & scheduled for re-review" },
                ].map((step) => (
                  <div key={step.title} className="proc-step">
                    <div className={`proc-num ${step.icon === "🔄" || step.icon === "🩺" ? "teal" : "blue"}`}>
                      {step.icon}
                    </div>
                    <h4>{step.title}</h4>
                    <p>{step.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="box box-g">
              <div className="bh">✅ Non-Negotiables</div>
              <ul>
                <li>Primary and secondary sources are recorded for every claim.</li>
                <li>Reviewers must be independent of the author on the same piece.</li>
                <li>No content is published on the strength of a single low-quality study.</li>
              </ul>
            </div>
          </section>

          <section className="section g" id="s5">
            <div className="sec-title">
              <div className="sn g">5</div>Evidence Standards
            </div>
            <div className="prose">
              <p>We weight sources using a standard evidence hierarchy. Higher-tier evidence takes priority whenever it exists.</p>
            </div>
            <div className="ev-tier ev-t1">
              <div className="ev-ico">🥇</div>
              <div>
                <h4>Tier 1 — Strongest</h4>
                <p>Systematic reviews, meta-analyses and high-quality randomised controlled trials.</p>
              </div>
            </div>
            <div className="ev-tier ev-t2">
              <div className="ev-ico">🥈</div>
              <div>
                <h4>Tier 2 — Strong</h4>
                <p>Well-designed cohort and case-control studies, and current clinical practice guidelines.</p>
              </div>
            </div>
            <div className="ev-tier ev-t3">
              <div className="ev-ico">🥉</div>
              <div>
                <h4>Tier 3 — Supporting</h4>
                <p>Expert consensus statements and authoritative public-health guidance, used with context.</p>
              </div>
            </div>
            <div className="ev-tier ev-no">
              <div className="ev-ico">🚫</div>
              <div>
                <h4>Not Accepted</h4>
                <p>Anecdote, promotional material, predatory-journal content, or unverified claims.</p>
              </div>
            </div>
          </section>

          <section className="section p" id="s6">
            <div className="sec-title">
              <div className="sn p">6</div>Peer Review &amp; Publication Ethics
            </div>
            <div className="box box-p">
              <div className="bh">⚖️ Ethical Commitments</div>
              <ul>
                <li>
                  <strong>Independence:</strong> advertisers and sponsors never influence editorial conclusions.
                </li>
                <li>
                  <strong>Disclosure:</strong> author affiliations, funding and conflicts of interest are stated openly.
                </li>
                <li>
                  <strong>Corrections:</strong> errors are corrected transparently with a visible correction notice.
                </li>
              </ul>
            </div>
            <div className="box box-b">
              <div className="bh">🔗 Read the full policies</div>
              <p>
                Our <Link href="/editorial-policy">Editorial Policy</Link> and{" "}
                <Link href="/author-guidelines">Author Guidelines</Link> describe every step in detail.
              </p>
            </div>
          </section>

          <section className="section a" id="s7">
            <div className="sec-title">
              <div className="sn a">7</div>Publication Types Explained
            </div>
            {[
              {
                id: "pub-type-0",
                title: "📘 Journal Article / Evidence Review",
                body: (
                  <>
                    <p>A structured synthesis of the current best evidence on a single condition or question.</p>
                    <ul>
                      <li>Typically 30–60 cited references.</li>
                      <li>Reviewed by a specialist in the relevant field.</li>
                    </ul>
                  </>
                ),
              },
              {
                id: "pub-type-1",
                title: "🩺 Clinical Explainer / Case Study",
                body: (
                  <p>Translates a clinical guideline or diagnosis into plain language for patients and caregivers.</p>
                ),
              },
              {
                id: "pub-type-2",
                title: "📊 Research Paper / Meta-Summary",
                body: <p>Pools and plainly summarises findings across several studies on the same topic.</p>,
              },
              {
                id: "pub-type-3",
                title: "🧭 Practice Guide",
                body: <p>Actionable, everyday guidance for common health decisions grounded in guideline recommendations.</p>,
              },
            ].map((item) => (
              <Accordion
                key={item.id}
                title={item.title}
                open={!!accordions[item.id]}
                onToggle={() => setAccordions((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
              >
                {item.body}
              </Accordion>
            ))}
          </section>

          <section className="section t" id="s8">
            <div className="sec-title">
              <div className="sn t">8</div>Data &amp; Transparency
            </div>
            <div className="table-scroll">
              <table className="sched-table">
                <thead>
                  <tr>
                    <th>What We Disclose</th>
                    <th>Where It Appears</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Author & qualifications", "Article byline", "Per publication"],
                    ["Reviewing physician", "Review badge & footer", "Per review"],
                    ["Full reference list", "End of article", "Every revision"],
                    ["Conflict-of-interest statement", "Article footer", "Annually / on change"],
                  ].map(([a, b, c]) => (
                    <tr key={a}>
                      <td>{a}</td>
                      <td>{b}</td>
                      <td>{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="section" id="s9">
            <div className="sec-title">
              <div className="sn">9</div>How to Cite Our Work
            </div>
            <p style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--gray-600)", margin: "12px 0 4px" }}>
              APA (7th edition)
            </p>
            <div className="cite-block">
              <button
                type="button"
                className="cite-copy"
                onClick={() =>
                  copyCite(
                    "DrInsight Editorial Team. (2026). Blood pressure targets in adults: A plain-language review of current guidelines. DrInsight. Retrieved from https://www.drinsight.org/research-publications",
                  )
                }
              >
                Copy
              </button>
              DrInsight Editorial Team. (2026). <em>Blood pressure targets in adults: A plain-language review of current guidelines.</em>{" "}
              DrInsight. Retrieved from https://www.drinsight.org/research-publications
            </div>
          </section>

          <section className="section g" id="s10">
            <div className="sec-title">
              <div className="sn g">10</div>Partners &amp; Collaborators
            </div>
            <div className="contrib-grid">
              {[
                ["🏥", "Hospital Clinicians", "Practising specialists who author and review in their field."],
                ["🎓", "Medical Educators", "Faculty who help translate complex topics for the public."],
                ["📑", "Guideline Bodies", "We align to recognised national and international guidance."],
                ["🔬", "Independent Reviewers", "External physicians who verify accuracy before publishing."],
              ].map(([icon, title, text]) => (
                <div key={title} className="contrib-card">
                  <div className="ci">{icon}</div>
                  <h4>{title}</h4>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="section p" id="s11">
            <div className="sec-title">
              <div className="sn p">11</div>Submit or Collaborate
            </div>
            <div className="cta-box">
              <h3>🔬 Work With Our Research Team</h3>
              <p>Propose a topic, submit a draft for editorial review, or partner with us on evidence summaries for the public.</p>
              <div className="cta-btns">
                <Link href="/contact" className="cta-btn">
                  ✉️ Submit a Proposal
                </Link>
                <Link href="/author-guidelines" className="cta-btn ghost">
                  📋 Author Guidelines
                </Link>
              </div>
            </div>
          </section>

          <section className="section a" id="s12">
            <div className="sec-title">
              <div className="sn a">12</div>Research &amp; Editorial Team
            </div>
            <div className="team-grid">
              {[
                ["JK", "Dr. Javed Kumbhar", "Founder", "MBBS, RMP", "linear-gradient(135deg,#1a56a0,#0891b2)"],
                ["AR", "Dr. A. Rehman", "Lead Author", "Cardiology", "linear-gradient(135deg,#7c3aed,#1a56a0)"],
                ["SF", "Dr. S. Fatima", "Reviewer", "Endocrinology", "linear-gradient(135deg,#059669,#0891b2)"],
              ].map(([initials, name, role, sub, bg]) => (
                <div key={name} className="team-card">
                  <div className="team-av" style={{ background: bg }}>
                    {initials}
                  </div>
                  <div className="team-role">{role}</div>
                  <h4>{name}</h4>
                  <p>{sub}</p>
                </div>
              ))}
            </div>
            <div className="box box-b">
              <div className="bh">👥 Meet everyone</div>
              <p>
                See full profiles on the <Link href="/our-doctors">Our Doctors</Link> page.
              </p>
            </div>
          </section>

          <section className="section" id="s13">
            <div className="sec-title">
              <div className="sn">13</div>Contact Research &amp; Editorial
            </div>
            <div className="contact-grid">
              {[
                ["📧 Research Enquiries", "mailto:contact@drinsight.org", "Collaborations & submissions"],
                ["✏️ Corrections", "mailto:contact@drinsight.org", "Report an error in an article"],
                ["📞 Editorial Desk", "tel:+923353545545", "Mon–Fri, 8AM–8PM"],
                ["💬 General Contact", "/contact", "Everything else"],
              ].map(([title, href, note]) => (
                <div key={title} className="contact-card">
                  <h4>{title}</h4>
                  {href.startsWith("/") ? (
                    <Link href={href}>Contact form</Link>
                  ) : (
                    <a href={href}>{href.replace("mailto:", "").replace("tel:", "")}</a>
                  )}
                  <p>{note}</p>
                </div>
              ))}
              <div className="contact-card">
                <h4>📍 Mailing Address</h4>
                <p>
                  DrInsight
                  <br />
                  Badin, Sindh Pakistan
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="policy-footer">
        <div className="pf-inner">
          <div className="pill-links">
            <Link href="/editorial-policy" className="pill-link">
              Editorial Policy
            </Link>
            <Link href="/author-guidelines" className="pill-link">
              Author Guidelines
            </Link>
            <Link href="/disclaimer" className="pill-link">
              Medical Disclaimer
            </Link>
          </div>
          <div className="pf-btns">
            <button type="button" className="pf-btn g" onClick={() => scrollTo("s11")}>
              🤝 Collaborate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
