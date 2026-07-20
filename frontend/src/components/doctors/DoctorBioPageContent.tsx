"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  SectionEyebrow,
  SectionTitle,
} from "@/components/public/section-heading";
import {
  buildAvailabilityRows,
  buildConsultationTypes,
  type DayScheduleConfig,
} from "@/lib/author-schedule";
import { authorProfileHref } from "@/lib/author-profile-url";
import {
  doctorFullName,
  formatCurrency,
  formatDate,
  formatStatCount,
  getInitials,
  gradientForId,
  specialtyEmoji,
  starsDisplay,
} from "@/lib/data-mappers";
import { resolveDoctorEducationHistory } from "@/lib/doctor-profile-form";
import type {
  DoctorArticleSummary,
  DoctorProfile,
  RelatedDoctorSummary,
} from "@/services/api-hooks";
import {
  useAuthorBySlug,
  useDoctor,
  useSubmitAuthorProfileFeedback,
} from "@/services/api-hooks";
import {
  PUBLICATION_TYPE_LABELS,
  useDoctorPublicationsByDoctor,
  type Publication,
} from "@/services/publications-api-hooks";
import "@/styles/author-bio-page.css";

type TabKey = "about" | "articles" | "reviews" | "credentials";

const THUMB_COLORS = [
  "linear-gradient(135deg,#f3f0ff,#ede9fe)",
  "linear-gradient(135deg,#fef2f2,#fee2e2)",
  "linear-gradient(135deg,#e0f7fa,#b2ebf2)",
  "linear-gradient(135deg,#fdf4ff,#f5d0fe)",
  "linear-gradient(135deg,#ecfdf5,#d1fae5)",
  "linear-gradient(135deg,#fff7ed,#fed7aa)",
];

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function countryFlag(country?: string | null): string {
  if (!country) return "🇵🇰";
  const c = country.toLowerCase();
  if (c.includes("pakistan")) return "🇵🇰";
  if (c.includes("united states") || c === "usa" || c === "us") return "🇺🇸";
  if (c.includes("united kingdom") || c === "uk") return "🇬🇧";
  if (c.includes("india")) return "🇮🇳";
  return "🌍";
}

function speakClass(type: string): string {
  if (type === "conference") return "speak-conference";
  if (type === "webinar") return "speak-webinar";
  return "speak-lecture";
}

function speakLabel(type: string): string {
  if (type === "conference") return "Conference";
  if (type === "webinar") return "Webinar";
  if (type === "lecture") return "Grand Rounds";
  return type;
}

function reviewTypeLabel(review: NonNullable<DoctorProfile["reviews"]>[number]): string {
  const type = review.appointment?.consultationType;
  if (type === "VIDEO") return `📹 Video Consultation · ${review.appointment?.reason ?? "Consultation"}`;
  if (type === "AUDIO") return `📞 Phone Consultation · ${review.appointment?.reason ?? "Consultation"}`;
  if (type === "CHAT") return `💬 Chat Consultation · ${review.appointment?.reason ?? "Consultation"}`;
  return `⭐ Patient Review · Consultation`;
}

function MiniDoctorRow({
  doctor,
  variant,
}: {
  doctor: RelatedDoctorSummary;
  variant: "colleague" | "other";
}) {
  const name = doctorFullName(doctor.user);
  const initials = getInitials(doctor.user?.firstName, doctor.user?.lastName);
  const bg = gradientForId(doctor.id);
  const locationLabel = [doctor.city, doctor.country].filter(Boolean).join(", ");

  if (variant === "colleague") {
    return (
      <div className="colleague-card">
        <div className="col-av" style={{ background: bg }}>
          {initials}
        </div>
        <div>
          <div className="col-name">{name}</div>
          <div className="col-spec">
            {doctor.specialty}
            {doctor.subSpecialty ? ` · ${doctor.subSpecialty}` : ""}
          </div>
        </div>
        <Link href={authorProfileHref(doctor)} className="follow-sm">
          View
        </Link>
      </div>
    );
  }

  return (
    <Link href={authorProfileHref(doctor)} className="other-doc-item">
      <div className="od-av" style={{ background: bg }}>
        {initials}
      </div>
      <div className="od-info">
        <div className="od-name">{name}</div>
        <div className="od-spec">{doctor.specialty}</div>
        <div className="od-rating">
          ⭐ {doctor.rating.toFixed(1)}
          {locationLabel ? ` · ${locationLabel}` : ""}
        </div>
      </div>
    </Link>
  );
}

function ArticleListItem({ article, index }: { article: DoctorArticleSummary; index: number }) {
  const emoji = specialtyEmoji(article.category?.name ?? "");
  const thumb = THUMB_COLORS[index % THUMB_COLORS.length];
  return (
    <Link href={`/blog/${article.slug}`} className="art-card-bio">
      <div className="art-thumb-sm" style={{ background: thumb }}>
        {emoji}
      </div>
      <div className="art-info">
        <div className="art-cat">{article.category?.name ?? "Health"}</div>
        <div className="art-title-bio">{article.title}</div>
        <div className="art-meta-bio">
          {article.publishedAt ? formatDate(article.publishedAt) : "Draft"} ·{" "}
          {formatViews(article.viewCount)} views
          {article.averageRating != null && article.averageRating > 0
            ? ` · ⭐ ${article.averageRating.toFixed(1)}`
            : ""}{" "}
          · {article.readTimeMinutes} min read
        </div>
      </div>
      <span className="art-status as-live">Live</span>
    </Link>
  );
}

function PublicationBioCard({ pub }: { pub: Publication }) {
  const year = pub.publicationDate
    ? new Date(pub.publicationDate).getFullYear()
    : pub.publishedAt
      ? new Date(pub.publishedAt).getFullYear()
      : null;
  const journalLine = [pub.journalName?.toUpperCase(), year].filter(Boolean).join(" · ");

  return (
    <Link href={`/research-publications/${pub.slug}`} className="pub-item pub-item-link">
      <div className="pub-journal">{journalLine || PUBLICATION_TYPE_LABELS[pub.publicationType]}</div>
      <div className="pub-title">{pub.title}</div>
      <div className="pub-meta">
        {year ? <span className="pub-year">{year}</span> : null}
        {pub.citationCount > 0 && <span className="pub-cite">📌 {pub.citationCount} citations</span>}
        {pub.doi ? <span className="pub-doi">DOI: {pub.doi}</span> : null}
      </div>
    </Link>
  );
}

function PublicationsSection({
  publications,
  researchTags,
  publicationCount,
  onViewAll,
}: {
  publications: Publication[];
  researchTags: string[];
  publicationCount: number;
  onViewAll: () => void;
}) {
  if (publications.length === 0) return null;

  return (
    <div className="s-card">
      <div className="s-title">🔬 Research & Publications</div>
      {publications.slice(0, 4).map((pub) => (
        <PublicationBioCard key={pub.id} pub={pub} />
      ))}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 14,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {researchTags.length > 0 && (
          <div className="research-tags">
            {researchTags.map((tag) => (
              <span key={tag} className="res-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
        <button type="button" className="view-all-pubs-btn" onClick={onViewAll}>
          View All {publicationCount > 0 ? `${publicationCount}+ ` : ""}Publications →
        </button>
      </div>
    </div>
  );
}

function PublishedArticlesSection({
  articles,
  articleCount,
  visibleCount,
  onLoadMore,
}: {
  articles: DoctorArticleSummary[];
  articleCount: number;
  visibleCount: number;
  onLoadMore: () => void;
}) {
  const visible = articles.slice(0, visibleCount);
  if (visible.length === 0) return null;

  return (
    <div className="s-card">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div className="s-title" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: "none" }}>
          📰 Published Articles{" "}
          <span style={{ fontSize: ".76rem", fontWeight: 500, color: "var(--gray-400)" }}>
            ({articleCount} total)
          </span>
        </div>
        <Link href="/blog" style={{ fontSize: ".78rem", color: "var(--blue)", fontWeight: 600 }}>
          View all on Blog →
        </Link>
      </div>
      <div className="article-list">
        {visible.map((article, index) => (
          <ArticleListItem key={article.id} article={article} index={index} />
        ))}
      </div>
      {visibleCount < articles.length && (
        <div style={{ marginTop: 18, textAlign: "center" }}>
          <button type="button" className="load-more" onClick={onLoadMore}>
            Load More Articles ({articles.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}

export function AuthorBioPageContent({
  slug,
  doctorId,
}: {
  slug?: string;
  doctorId?: string;
}) {
  const bySlug = useAuthorBySlug(slug ?? "");
  const byId = useDoctor(doctorId ?? "");
  const profileQuery = slug ? bySlug : byId;
  const doctor = profileQuery.data;
  const { isLoading, isError } = profileQuery;
  const profileFeedback = useSubmitAuthorProfileFeedback();
  const { data: approvedPublications = [] } = useDoctorPublicationsByDoctor(doctor?.id ?? "", 20);
  const [tab, setTab] = useState<TabKey>("about");
  const [bioOpen, setBioOpen] = useState(false);
  const [articlesVisible, setArticlesVisible] = useState(6);
  const [reviewsVisible, setReviewsVisible] = useState(5);
  const [toast, setToast] = useState("");
  const [helpful, setHelpful] = useState<"yes" | "no" | null>(null);
  const [imgError, setImgError] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
  };

  const educationHistory = useMemo(
    () => resolveDoctorEducationHistory(doctor),
    [doctor?.education, doctor?.educationHistory],
  );
  const certifications = useMemo(
    () => asArray<NonNullable<DoctorProfile["certifications"]>[number]>(doctor?.certifications),
    [doctor?.certifications],
  );
  const awards = useMemo(
    () => asArray<NonNullable<DoctorProfile["awards"]>[number]>(doctor?.awards),
    [doctor?.awards],
  );
  const speaking = useMemo(
    () => asArray<NonNullable<DoctorProfile["speakingEngagements"]>[number]>(doctor?.speakingEngagements),
    [doctor?.speakingEngagements],
  );
  const onlineSchedule = doctor?.onlineSchedule as DayScheduleConfig | null | undefined;
  const clinicSchedule = doctor?.clinicSchedule as DayScheduleConfig | null | undefined;
  const onlineAvailability = useMemo(() => buildAvailabilityRows(onlineSchedule), [onlineSchedule]);
  const physicalAvailability = useMemo(() => buildAvailabilityRows(clinicSchedule), [clinicSchedule]);
  const consultationTypes = useMemo(
    () => buildConsultationTypes(onlineSchedule, Number(doctor?.consultationFee ?? 0)),
    [onlineSchedule, doctor?.consultationFee],
  );
  const expertise = doctor?.expertise ?? [];
  const researchTags = doctor?.researchTags ?? expertise.slice(0, 6);
  const articles = doctor?.articles ?? [];
  const reviews = doctor?.reviews ?? [];
  const relatedDoctors = doctor?.relatedDoctors ?? [];
  const similarSpecialists = doctor?.similarSpecialists ?? [];

  const articleCategories = useMemo(() => {
    const map = new Map<string, { slug: string; name: string; count: number }>();
    for (const a of articles) {
      const slug = a.category?.slug ?? "health";
      const name = a.category?.name ?? "Health";
      const prev = map.get(slug);
      map.set(slug, { slug, name, count: (prev?.count ?? 0) + 1 });
    }
    return Array.from(map.values());
  }, [articles]);

  const ratingDistribution = doctor?.ratingDistribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const totalRated = Object.values(ratingDistribution).reduce((s, n) => s + n, 0) || doctor?.reviewCount || 1;
  const recommendPct =
    totalRated > 0
      ? Math.round((((ratingDistribution[5] ?? 0) + (ratingDistribution[4] ?? 0)) / totalRated) * 100)
      : 0;

  if (isLoading) {
    return (
      <div className="author-bio-page">
        <div className="page-loading">Loading author profile…</div>
      </div>
    );
  }

  if (isError || !doctor) {
    return (
      <div className="author-bio-page">
        <div className="page-error">
          <h2>Author profile not found</h2>
          <p>This author profile is unavailable or may have been removed.</p>
          <Link href="/our-doctors">← Back to Our Doctors</Link>
        </div>
      </div>
    );
  }

  const name = doctorFullName(doctor.user);
  const lastName = doctor.user?.lastName ?? "Doctor";
  const emoji = specialtyEmoji(doctor.specialty);
  const avatarBg = gradientForId(doctor.id);
  const articleCount = doctor.articleStats?.count ?? articles.length;
  const totalViews = doctor.articleStats?.totalViews ?? 0;
  const consultations = doctor.patientsTreated ?? doctor.consultationCount ?? 0;
  const authorLocation = [doctor.city, doctor.country].filter(Boolean).join(", ");
  const commentCount = doctor.commentCount ?? doctor.reviewCount ?? 0;
  const publicationCount = doctor.publicationCount ?? approvedPublications.length;
  const bookingEnabled = doctor.bookingEnabled !== false;
  const onlineAvailEnabled = doctor.onlineAvailEnabled !== false;
  const physicalAvailEnabled = doctor.physicalAvailEnabled !== false;
  const licenseBoard = doctor.licenseBoard ?? "PMDC";
  const credLine = [
    doctor.professionalTitle ?? `Consultant ${doctor.specialty}`,
    doctor.subSpecialty,
    ...(expertise.slice(0, 2).filter((e) => e !== doctor.subSpecialty)),
  ]
    .filter(Boolean)
    .join(" · ");
  const authorSince = doctor.user?.createdAt
    ? formatDate(doctor.user.createdAt, { month: "long", year: "numeric" })
    : doctor.createdAt
      ? formatDate(doctor.createdAt, { month: "long", year: "numeric" })
      : "—";
  const verifiedLabel = doctor.credentialsVerifiedAt
    ? formatDate(doctor.credentialsVerifiedAt, { month: "long", year: "numeric" })
    : "Recently";
  const profileUpdated = doctor.updatedAt
    ? formatDate(doctor.updatedAt, { month: "long", day: "numeric", year: "numeric" })
    : verifiedLabel;
  const isOnline = doctor.user?.isOnline === true || doctor.availability === "AVAILABLE";

  const visibleArticles = articles.slice(0, articlesVisible);
  const visibleReviews = reviews.slice(0, reviewsVisible);

  const shareProfile = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: name, text: `View ${name} on DrInsight`, url });
        return;
      } catch {
        /* fall through */
      }
    }
    if (navigator.clipboard && url) {
      await navigator.clipboard.writeText(url);
      showToast("Profile link copied to clipboard.");
      return;
    }
    showToast("Share this page URL from your browser.");
  };

  const submitHelpful = async (value: "yes" | "no") => {
    setHelpful(value);
    try {
      await profileFeedback.mutateAsync({
        doctorId: doctor.id,
        helpful: value === "yes",
        viewerKey: typeof window !== "undefined" ? window.localStorage.getItem("drinsight_viewer_key") ?? undefined : undefined,
      });
      showToast(value === "yes" ? "Thank you for your feedback!" : "We'll improve this profile.");
    } catch {
      showToast(value === "yes" ? "Thank you for your feedback!" : "We'll improve this profile.");
    }
  };

  return (
    <div className="author-bio-page">
      <div
        className="hero-banner"
        style={
          doctor.coverImageUrl
            ? {
                backgroundImage: `linear-gradient(135deg, rgba(15,61,122,.88), rgba(26,86,160,.82), rgba(8,145,178,.78)), url(${doctor.coverImageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div className="hero-inner">
          <div className="hero-av-wrap">
            <div
              className={`hero-photo${doctor.user?.avatarUrl && !imgError ? " has-img" : ""}`}
              style={{ background: avatarBg }}
            >
              {doctor.user?.avatarUrl && !imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={doctor.user.avatarUrl}
                  alt={name}
                  onError={() => setImgError(true)}
                />
              ) : (
                emoji
              )}
            </div>
            {doctor.credentialsVerifiedAt && (
              <div className="hero-verified-ring" aria-label="Verified">
                ✓
              </div>
            )}
            {isOnline && <div className="hero-av-online" aria-hidden="true" />}
          </div>

          <div className="hero-info">
            <div className="hero-eyebrow">
              <span className="hero-badge verified">✅ Medically Verified Author</span>
              <span className="hero-badge">
                {emoji} {doctor.specialty}
              </span>
              {doctor.rating >= 4.5 && <span className="hero-badge">⭐ Top Rated</span>}
              {doctor.editorialBoard && (
                <span className="hero-badge">🏥 DrInsight Editorial Board</span>
              )}
            </div>
            <h1>
              {name}{" "}
              {doctor.credentials && (
                <span style={{ fontSize: ".65em", fontWeight: 400, opacity: 0.85 }}>
                  {doctor.credentials}
                </span>
              )}
            </h1>
            <div className="hero-cred">{credLine}</div>
            <div className="hero-meta">
              {doctor.hospital && (
                <div className="hero-meta-item">
                  🏥 {doctor.professionalTitle ?? `Consultant ${doctor.specialty}`} — {doctor.hospital}
                </div>
              )}
              {authorLocation && (
                <div className="hero-meta-item">
                  📍 {countryFlag(doctor.country)} {authorLocation}
                </div>
              )}
              <div className="hero-meta-item">⏳ {doctor.experienceYears} Years in Practice</div>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <strong>{articleCount}</strong>
                <span>Articles</span>
              </div>
              <div className="hero-stat">
                <strong>{formatViews(totalViews)}</strong>
                <span>Total Views</span>
              </div>
              <div className="hero-stat">
                <strong>{doctor.rating.toFixed(1)} ★</strong>
                <span>Avg. Rating</span>
              </div>
              <div className="hero-stat">
                <strong>{formatStatCount(consultations).replace("+", "")}</strong>
                <span>Consultations</span>
              </div>
              <div className="hero-stat">
                <strong>{formatStatCount(commentCount).replace("+", "")}</strong>
                <span>Comments</span>
              </div>
            </div>
            <div className="action-btns">
              {bookingEnabled && (
                <Link href={`/book-consultation?doctorId=${doctor.id}`} className="action-btn primary">
                  📅 Book Consultation
                </Link>
              )}
              {doctor.user?.email && (
                <a href={`mailto:${doctor.user.email}`} className="action-btn outline">
                  📧 Contact Author
                </a>
              )}
              {doctor.twitterUrl && (
                <a href={doctor.twitterUrl} target="_blank" rel="noreferrer" className="action-btn outline">
                  𝕏 Twitter
                </a>
              )}
              {doctor.youtubeUrl && (
                <a href={doctor.youtubeUrl} target="_blank" rel="noreferrer" className="action-btn outline">
                  ▶️ YouTube
                </a>
              )}
              {doctor.linkedinUrl && (
                <a href={doctor.linkedinUrl} target="_blank" rel="noreferrer" className="action-btn outline">
                  🔗 LinkedIn
                </a>
              )}
              <button type="button" className="action-btn outline" onClick={shareProfile}>
                🔗 Share Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="main">
        <div>
          <div className="profile-tabs">
            {(
              [
                ["about", `👤 About`],
                ["articles", `📰 Articles & Research Publications (${articleCount})`],
                ["reviews", `⭐ Reviews (${doctor.reviewCount})`],
                ["credentials", `🎓 Credentials`],
              ] as const
            ).map(([key, label]) => (
              <div
                key={key}
                className={`ptab${tab === key ? " active" : ""}`}
                onClick={() => setTab(key)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setTab(key)}
              >
                {label}
              </div>
            ))}
          </div>

          {tab === "about" && (
            <div>
              <div className="callout-box">
                <p>
                  ⚕️ <strong>Medical Disclaimer:</strong> The information on this page is for educational
                  purposes only. Booking a consultation with {name} is for professional medical advice
                  tailored to your specific condition.
                </p>
              </div>

              <div className="s-card">
                <div className="s-title">👤 About {name}</div>
                <p className="bio-short">
                  {doctor.bio ??
                    `${name} is a ${doctor.specialty.toLowerCase()} specialist with ${doctor.experienceYears} years of experience.`}
                </p>
                {doctor.bioFull && (
                  <>
                    <div className={`bio-full${bioOpen ? " open" : ""}`}>
                      {doctor.bioFull.split(/\n\n+/).map((para) => (
                        <p key={para.slice(0, 24)}>{para}</p>
                      ))}
                    </div>
                    <button type="button" className="bio-toggle" onClick={() => setBioOpen((v) => !v)}>
                      {bioOpen ? "▾ Show Less Biography" : "▸ Read Full Biography"}
                    </button>
                  </>
                )}
              </div>

              {expertise.length > 0 && (
                <div className="s-card">
                  <div className="s-title">🩺 Areas of Expertise</div>
                  <div className="exp-tags">
                    {expertise.map((tag) => (
                      <span key={tag} className="exp-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {educationHistory.length > 0 && (
                <div className="s-card">
                  <div className="s-title">🎓 Education & Training</div>
                  <div className="timeline">
                    {educationHistory.map((item) => (
                      <div key={`${item.year}-${item.title}`} className="tl-item">
                        <div className="tl-dot">{item.icon ?? "🎓"}</div>
                        <div className="tl-body">
                          <div className="tl-year">{item.year}</div>
                          <div className="tl-title">{item.title}</div>
                          <div className="tl-inst">{item.institution}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {certifications.length > 0 && (
                <div className="s-card">
                  <div className="s-title">🏅 Board Certifications & Professional Memberships</div>
                  <div className="cert-grid">
                    {certifications.map((cert) => (
                      <div key={cert.title} className="cert-card">
                        <div className="cert-ico">{cert.icon ?? "✓"}</div>
                        <div>
                          <h4>{cert.title}</h4>
                          <p>{cert.subtitle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {awards.length > 0 && (
                <div className="s-card">
                  <div className="s-title">🏆 Awards & Honors</div>
                  <div className="award-list">
                    {awards.map((award) => (
                      <div key={`${award.year}-${award.title}`} className="award-item">
                        <div className="award-ico">{award.icon ?? "🥇"}</div>
                        <div>
                          <h4>{award.title}</h4>
                          <p>{award.organization}</p>
                          <span className="award-year">{award.year}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {speaking.length > 0 && (
                <div className="s-card">
                  <div className="s-title">🎤 Lectures, Conferences & Teaching</div>
                  <div className="speaking-list">
                    {speaking.map((item) => (
                      <div key={`${item.year}-${item.title}`} className="speak-item">
                        <div>
                          <h4>{item.title}</h4>
                          <p>{item.venue}</p>
                          <span className={`speak-type ${speakClass(item.type)}`}>
                            {speakLabel(item.type)} · {item.year}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <PublishedArticlesSection
                articles={articles}
                articleCount={articleCount}
                visibleCount={articlesVisible}
                onLoadMore={() => setArticlesVisible((n) => n + 6)}
              />

              <PublicationsSection
                publications={approvedPublications}
                researchTags={researchTags}
                publicationCount={publicationCount}
                onViewAll={() => showToast("Loading all publications...")}
              />

              <div className="s-card">
                <div className="s-title">✍️ Role at DrInsight</div>
                <div className="role-grid">
                  <div className="role-item">
                    <h4>Author Since</h4>
                    <p>{authorSince}</p>
                  </div>
                  <div className="role-item">
                    <h4>Articles Published</h4>
                    <p>
                      {articleCount} peer-reviewed article{articleCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="role-item">
                    <h4>Medical Reviewer For</h4>
                    <p>{doctor.medicalReviewerFor ?? doctor.specialty}</p>
                  </div>
                  <div className="role-item">
                    <h4>Editorial Board</h4>
                    <p>
                      {doctor.editorialBoard
                        ? `✅ Yes — ${doctor.platformRole ?? `${doctor.specialty} Section Editor`}`
                        : doctor.platformRole ?? "Contributing Author"}
                    </p>
                  </div>
                </div>
                <div className="role-links">
                  <Link href="/editorial-policy" className="role-link">
                    📋 Editorial Guidelines →
                  </Link>
                  <Link href="/editorial-policy" className="role-link">
                    🔍 Medical Review Process →
                  </Link>
                  <a href="#credentials" className="role-link danger" onClick={() => setTab("credentials")}>
                    ⚖️ Conflict of Interest Disclosure →
                  </a>
                </div>
                <p style={{ fontSize: ".72rem", color: "var(--gray-400)", marginTop: 10 }}>
                  Profile last updated: {profileUpdated} · Credentials verified by DrInsight Editorial
                  Team
                </p>
              </div>
            </div>
          )}

          {tab === "articles" && (
            <>
              <PublishedArticlesSection
                articles={articles}
                articleCount={articleCount}
                visibleCount={articlesVisible}
                onLoadMore={() => setArticlesVisible((n) => n + 6)}
              />
              <PublicationsSection
                publications={approvedPublications}
                researchTags={researchTags}
                publicationCount={publicationCount}
                onViewAll={() => showToast("Loading all publications...")}
              />
            </>
          )}

          {tab === "reviews" && (
            <div className="s-card" style={{ marginBottom: 0 }}>
              <div className="s-title">
                ⭐ Patient & Reader Reviews{" "}
                <span style={{ fontSize: ".76rem", fontWeight: 500, color: "var(--gray-400)" }}>
                  ({commentCount} verified)
                </span>
              </div>
              <div className="rating-summary">
                <div>
                  <div className="big-rating">{doctor.rating.toFixed(1)}</div>
                  <div className="stars" style={{ fontSize: "1.1rem", marginTop: 4, color: "var(--amber)" }}>
                    {starsDisplay(doctor.rating)}
                  </div>
                  <div style={{ fontSize: ".76rem", color: "var(--gray-400)", marginTop: 4 }}>
                    {doctor.reviewCount} reviews · {recommendPct}% recommend
                  </div>
                </div>
                <div className="rating-bars">
                  {([5, 4, 3, 2, 1] as const).map((star) => {
                    const count = ratingDistribution[star] ?? 0;
                    const pct = Math.max(0, Math.round((count / totalRated) * 100));
                    return (
                      <div key={star} className="rbar-row">
                        <span className="rbar-lbl">{star} ★</span>
                        <div className="rbar">
                          <div className="rbar-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="rbar-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {visibleReviews.length === 0 ? (
                <div className="empty-state">No reviews yet.</div>
              ) : (
                visibleReviews.map((review) => {
                  const patient = review.patient?.user;
                  const patientName = patient
                    ? `${patient.firstName} ${patient.lastName?.[0] ?? ""}.`
                    : "Patient";
                  const patientInitials = getInitials(patient?.firstName, patient?.lastName);
                  return (
                    <div key={review.id} className="review-item">
                      <div className="rev-hd">
                        <div className="rev-av" style={{ background: gradientForId(review.id) }}>
                          {patientInitials}
                        </div>
                        <span className="rev-name">{patientName}</span>
                        <span className="rev-date">{formatDate(review.createdAt)}</span>
                      </div>
                      <div className="rev-stars">{starsDisplay(review.rating)}</div>
                      {review.comment && <div className="rev-text">&ldquo;{review.comment}&rdquo;</div>}
                      <div className="rev-type">{reviewTypeLabel(review)}</div>
                    </div>
                  );
                })
              )}
              {reviewsVisible < reviews.length && (
                <div style={{ marginTop: 16, textAlign: "center" }}>
                  <button
                    type="button"
                    className="load-more-soft"
                    onClick={() => setReviewsVisible((n) => n + 5)}
                  >
                    Load More Reviews ({reviews.length - reviewsVisible} remaining)
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === "credentials" && (
            <div>
              <div className="s-card">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <div
                    className="s-title"
                    style={{ marginBottom: 0, paddingBottom: 0, borderBottom: "none" }}
                  >
                    🎓 Verified Credentials
                  </div>
                  <span style={{ fontSize: ".76rem", color: "var(--green)", fontWeight: 600 }}>
                    ✓ Board Certified · Last verified {verifiedLabel}
                  </span>
                </div>
                <div className="cred-grid">
                  {educationHistory[0] && (
                    <div className="cred-item">
                      <div className="cred-label">Medical Degree</div>
                      <div className="cred-val">{educationHistory[0].title}</div>
                      <div className="cred-sub">
                        {educationHistory[0].institution} · {educationHistory[0].year}
                      </div>
                    </div>
                  )}
                  {educationHistory[1] && (
                    <div className="cred-item">
                      <div className="cred-label">Postgraduate Degree</div>
                      <div className="cred-val">{educationHistory[1].title}</div>
                      <div className="cred-sub">
                        {educationHistory[1].institution} · {educationHistory[1].year}
                      </div>
                    </div>
                  )}
                  {educationHistory[2] && (
                    <div className="cred-item">
                      <div className="cred-label">Fellowship</div>
                      <div className="cred-val">{educationHistory[2].title}</div>
                      <div className="cred-sub">
                        {educationHistory[2].institution} · {educationHistory[2].year}
                      </div>
                    </div>
                  )}
                  {educationHistory.length === 0 && doctor.education && (
                    <div className="cred-item">
                      <div className="cred-label">Education Summary</div>
                      <div className="cred-val">{doctor.education}</div>
                    </div>
                  )}
                  {doctor.licenseNumber && (
                    <div className="cred-item">
                      <div className="cred-label">Medical Licence</div>
                      <div className="cred-val">{doctor.licenseNumber}</div>
                      <div className="cred-sub">PMDC · Active & Unrestricted</div>
                    </div>
                  )}
                  {certifications[0] && (
                    <div className="cred-item">
                      <div className="cred-label">Board Certification</div>
                      <div className="cred-val">{certifications[0].title}</div>
                      <div className="cred-sub">{certifications[0].subtitle}</div>
                    </div>
                  )}
                  {doctor.subSpecialty && (
                    <div className="cred-item">
                      <div className="cred-label">Sub-specialty Training</div>
                      <div className="cred-val">{doctor.subSpecialty}</div>
                      <div className="cred-sub">{doctor.hospital ?? doctor.specialty}</div>
                    </div>
                  )}
                  <div className="cred-item">
                    <div className="cred-label">DrInsight Role</div>
                    <div className="cred-val">
                      {doctor.platformRole ?? `${doctor.specialty} Contributing Author`}
                    </div>
                    <div className="cred-sub">DrInsight · Since {authorSince}</div>
                  </div>
                </div>
                <div className="verified-box">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: "1rem" }}>✅</span>
                    <strong style={{ fontSize: ".86rem", color: "var(--green)" }}>
                      {licenseBoard} Verification Status: Active
                    </strong>
                  </div>
                  <p style={{ fontSize: ".8rem", color: "#065f46", lineHeight: 1.65 }}>
                    {doctor.verificationNote ??
                      `${name}'s medical licence, board certifications, and disciplinary status are verified by DrInsight's editorial team. No disciplinary proceedings or restrictions exist on this licence as of ${verifiedLabel}.`}
                  </p>
                </div>
              </div>
              {doctor.conflictOfInterest && (
                <div className="s-card" style={{ marginBottom: 0 }}>
                  <div className="s-title">💰 Conflict of Interest Disclosure</div>
                  <div className="coi-box">
                    <p style={{ fontSize: ".86rem", color: "var(--gray-700)", lineHeight: 1.7 }}>
                      <strong>Declaration:</strong> {doctor.conflictOfInterest}
                    </p>
                    <p style={{ fontSize: ".8rem", color: "var(--gray-500)", marginTop: 8 }}>
                      Disclosure last updated: {profileUpdated} · Reviewed annually in accordance with
                      DrInsight&apos;s COI Policy.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="sidebar">
          {bookingEnabled && (
            <div className="book-card" id="card-book-consultation">
              <h4>📅 Book a Consultation</h4>
              <p>
                Speak with {name} via video, phone, or secure chat — from anywhere in the world.
              </p>
              <div className="book-types">
                {consultationTypes.map((item) => (
                  <div key={item.label} className="book-type">
                    <span className="bt-icon">{item.icon}</span>
                    <div className="bt-info">
                      <strong>{item.label}</strong>
                      <span>{item.hint}</span>
                    </div>
                    {item.price != null && <span className="bt-price">{formatCurrency(item.price)}</span>}
                  </div>
                ))}
              </div>
              <Link href={`/book-consultation?doctorId=${doctor.id}`} className="book-btn" style={{ display: "block", textAlign: "center" }}>
                📅 Book Now
              </Link>
              <Link href="/ask-doctor" className="ask-btn" style={{ display: "block", textAlign: "center" }}>
                ❓ Ask a Free Question
              </Link>
            </div>
          )}

          <div className="sidebar-card">
            <div className="sb-title">📬 Contact {name}</div>
            {doctor.user?.email && (
              <div className="contact-item">
                ✉️ <a href={`mailto:${doctor.user.email}`}>{doctor.user.email}</a>
              </div>
            )}
            {doctor.hospital && (
              <div className="contact-item">
                🏥 <span>{doctor.hospital}</span>
              </div>
            )}
            {doctor.linkedinUrl && (
              <div className="contact-item">
                🔗{" "}
                <a href={doctor.linkedinUrl} target="_blank" rel="noreferrer">
                  LinkedIn Profile
                </a>
              </div>
            )}
            {doctor.twitterUrl && (
              <div className="contact-item">
                𝕏{" "}
                <a href={doctor.twitterUrl} target="_blank" rel="noreferrer">
                  Twitter Profile
                </a>
              </div>
            )}
            {!doctor.user?.email && !doctor.hospital && !doctor.linkedinUrl && !doctor.twitterUrl && (
              <div className="empty-state" style={{ padding: 8 }}>
                Contact details not published.
              </div>
            )}
          </div>

          {onlineAvailEnabled && onlineAvailability.length > 0 && (
            <div className="sidebar-card" id="card-online-avail">
              <div className="sb-title">🕐 Online Consultation Availability</div>
              {onlineAvailability.map((day) => (
                <div key={day.day} className="avail-row">
                  <span className="avail-day">
                    <span className={`avail-dot ${day.available ? "dot-g" : "dot-r"}`} />
                    {day.day}
                  </span>
                  <span className={`avail-time${day.available ? "" : " closed"}`}>{day.time}</span>
                </div>
              ))}
              {doctor.responseTime && (
                <div style={{ marginTop: 10, fontSize: ".74rem", color: "var(--gray-400)", textAlign: "center" }}>
                  📅 Next available: {doctor.responseTime}
                </div>
              )}
            </div>
          )}

          {physicalAvailEnabled && physicalAvailability.length > 0 && (
            <div className="sidebar-card" id="card-physical-avail">
              <div className="sb-title">🏥 Physical Appointment</div>
              {physicalAvailability.map((day) => (
                <div key={day.day} className="avail-row">
                  <span className="avail-day">
                    <span className={`avail-dot ${day.available ? "dot-g" : "dot-r"}`} />
                    {day.day}
                  </span>
                  <span className={`avail-time${day.available ? "" : " closed"}`}>{day.time}</span>
                </div>
              ))}
              {doctor.hospital && (
                <div style={{ marginTop: 10, fontSize: ".74rem", color: "var(--gray-400)", textAlign: "center" }}>
                  🏥 In-person visits at {doctor.hospital}
                </div>
              )}
            </div>
          )}

          <div className="sidebar-card">
            <div className="sb-title">📋 Quick Facts</div>
            {doctor.languages.length > 0 && (
              <div className="fact-row">
                <span className="fact-ico">🌍</span>
                <div className="fact-info">
                  <strong>Languages</strong>
                  <span>{doctor.languages.join(", ")}</span>
                </div>
              </div>
            )}
            {authorLocation && (
              <div className="fact-row">
                <span className="fact-ico">📍</span>
                <div className="fact-info">
                  <strong>Location</strong>
                  <span>{authorLocation}</span>
                </div>
              </div>
            )}
            {doctor.hospital && (
              <div className="fact-row">
                <span className="fact-ico">🏥</span>
                <div className="fact-info">
                  <strong>Hospital</strong>
                  <span>{doctor.hospital}</span>
                </div>
              </div>
            )}
            {doctor.responseTime && (
              <div className="fact-row">
                <span className="fact-ico">⏱️</span>
                <div className="fact-info">
                  <strong>Response Time</strong>
                  <span>{doctor.responseTime}</span>
                </div>
              </div>
            )}
            <div className="fact-row">
              <span className="fact-ico">✅</span>
              <div className="fact-info">
                <strong>Consultations Done</strong>
                <span>{formatStatCount(consultations)}</span>
              </div>
            </div>
            {doctor.researchGrantsTotal && (
              <div className="fact-row">
                <span className="fact-ico">🔬</span>
                <div className="fact-info">
                  <strong>Research Grants</strong>
                  <span>{doctor.researchGrantsTotal}</span>
                </div>
              </div>
            )}
          </div>

          {articleCategories.length > 0 && (
            <div className="sidebar-card">
              <div className="sb-title">
                {emoji} Browse Articles By Specialty
              </div>
              {articleCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/blog?category=${cat.slug}`}
                  className="spec-link"
                >
                  <span>
                    {specialtyEmoji(cat.name)} {cat.name}
                  </span>
                  <span style={{ fontSize: ".7rem", color: "var(--blue)" }}>
                    {cat.count} articles →
                  </span>
                </Link>
              ))}
            </div>
          )}

          {reviews.length > 0 && (
            <div className="sidebar-card">
              <div className="sb-title">💬 Reader Testimonials</div>
              {reviews.slice(0, 3).map((review, idx) => {
                const patient = review.patient?.user;
                const patientName = patient
                  ? `${patient.firstName} ${patient.lastName?.[0] ?? ""}.`
                  : "Patient";
                const borders = ["var(--blue)", "var(--teal)", "var(--purple)"];
                return (
                  <div
                    key={review.id}
                    className="testimonial-mini"
                    style={{ borderLeftColor: borders[idx % borders.length] }}
                  >
                    <p>
                      &ldquo;
                      {review.comment ?? "Excellent consultation experience."}
                      &rdquo;
                    </p>
                    <div className="t-author">
                      {patientName} — {starsDisplay(review.rating)} Verified Reader
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {similarSpecialists.length > 0 && (
            <div className="sidebar-card">
              <div className="sb-title">👥 You May Also Follow</div>
              {similarSpecialists.slice(0, 3).map((d) => (
                <MiniDoctorRow key={d.id} doctor={d} variant="colleague" />
              ))}
            </div>
          )}

          {relatedDoctors.length > 0 && (
            <div className="other-docs">
              <div className="other-docs-hd">👨‍⚕️ More Specialists</div>
              {relatedDoctors.map((d) => (
                <MiniDoctorRow key={d.id} doctor={d} variant="other" />
              ))}
              <div style={{ padding: "10px 16px", textAlign: "center", borderTop: "1px solid var(--gray-100)" }}>
                <Link href="/our-doctors" style={{ fontSize: ".78rem", color: "var(--blue)", fontWeight: 700 }}>
                  View All Doctors →
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>

      <div className="trust-section">
        <div style={{ maxWidth: 1240, margin: "0 auto 20px", padding: "0 24px" }}>
          <div
            style={{
              fontSize: ".68rem",
              fontWeight: 700,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: "var(--blue)",
              marginBottom: 6,
            }}
          >
            Transparency
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.3rem",
              color: "var(--gray-900)",
              marginBottom: 4,
            }}
          >
            🛡️ Our Commitment to Accuracy
          </h2>
          <p style={{ fontSize: ".86rem", color: "var(--gray-600)" }}>
            How we vet our authors and ensure the highest standards of medical credibility
          </p>
        </div>
        <div className="trust-inner">
          <div className="trust-item">
            <i>🔍</i>
            <h4>Credential Verification</h4>
            <p>
              All author credentials, board certifications, and medical licences are independently
              verified by our editorial team before publication.
            </p>
            <Link href="/editorial-policy">Editorial Standards →</Link>
          </div>
          <div className="trust-item">
            <i>📋</i>
            <h4>Medical Review Process</h4>
            <p>
              Every article undergoes a multi-step review by a specialist before and after publication,
              with quarterly content updates.
            </p>
            <Link href="/editorial-policy">Review Process →</Link>
          </div>
          <div className="trust-item">
            <i>⚖️</i>
            <h4>Conflict of Interest Policy</h4>
            <p>
              All authors disclose any potential financial or professional conflicts of interest before
              publishing on DrInsight.
            </p>
            <button type="button" onClick={() => setTab("credentials")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
              <span style={{ fontSize: ".72rem", color: "var(--blue)", fontWeight: 600, display: "block", marginTop: 6 }}>
                COI Disclosure →
              </span>
            </button>
          </div>
          <div className="trust-item">
            <i>🔄</i>
            <h4>Content Currency</h4>
            <p>
              All articles are reviewed and updated at minimum every 6 months, or immediately when new
              clinical guidelines are published.
            </p>
            <Link href="/editorial-policy">Update Policy →</Link>
          </div>
        </div>
      </div>

      <div className="engagement-bar">
        <div className="eng-inner">
          <div className="eng-left">
            <span className="eng-label">Was this profile helpful?</span>
            <button
              type="button"
              className={`eng-btn yes${helpful === "yes" ? " active" : ""}`}
              onClick={() => submitHelpful("yes")}
            >
              {helpful === "yes" ? "👍 Thank you!" : "👍 Yes"}
            </button>
            <button
              type="button"
              className={`eng-btn no${helpful === "no" ? " active" : ""}`}
              onClick={() => submitHelpful("no")}
            >
              {helpful === "no" ? "👎 We'll improve" : "👎 No"}
            </button>
          </div>
          <button
            type="button"
            className="suggest-btn"
            onClick={() => showToast("Thanks! Suggest a topic form coming soon.")}
          >
            💡 Suggest an Article Topic for {name}
          </button>
          <Link href="/contact" style={{ fontSize: ".74rem", color: "var(--red)" }}>
            ⚠️ Report outdated information
          </Link>
        </div>
      </div>

      <div className="cta-strip">
        <SectionEyebrow light>Consult {name}</SectionEyebrow>
        <SectionTitle inverse>Book a {doctor.specialty} Consultation Today</SectionTitle>
        <p>
          Get a personalised consultation with {name} — video, phone, or chat. Same-day appointments
          available.
        </p>
        <div className="cta-btns">
          <Link href={`/book-consultation?doctorId=${doctor.id}`} className="btn-white">
            📅 Book with Dr. {lastName}
          </Link>
          <Link href="/ask-doctor" className="btn-ghost">
            💬 Ask a Question Free
          </Link>
        </div>
      </div>

      <div className={`toast${toast ? " show" : ""}`}>{toast}</div>
    </div>
  );
}

export function DoctorBioPageContent({ doctorId }: { doctorId: string }) {
  return <AuthorBioPageContent doctorId={doctorId} />;
}
