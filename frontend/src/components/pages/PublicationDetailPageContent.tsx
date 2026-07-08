"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import "@/styles/research-publication-detail.css";
import { formatDate, getInitials, gradientForId } from "@/lib/data-mappers";
import { formatNumber } from "@/lib/admin-utils";
import {
  PUBLICATION_STATUS_LABELS,
  PUBLICATION_TYPE_LABELS,
  publicationAuthorsLine,
  publicationCoverUrl,
  publicationPdfUrl,
  usePublicationBySlug,
  useRelatedPublications,
  usePublicPublications,
  useTogglePublicationBookmark,
  useTrackPublicationDownload,
  useTrackPublicationShare,
  type Publication,
  type PublicationAttachment,
} from "@/services/publications-api-hooks";
import { useAuthStore } from "@/store/auth.store";

function attachmentsByType(pub: Publication, type: PublicationAttachment["type"]) {
  return pub.attachments?.filter((a) => a.type === type) ?? [];
}

function pubYear(pub: Publication): string {
  const d = pub.publicationDate ?? pub.publishedAt;
  if (!d) return "—";
  return String(new Date(d).getFullYear());
}

function ContentSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <section className="detail-section">
      <h2>
        <span>{icon}</span> {title}
      </h2>
      {children}
    </section>
  );
}

export function PublicationDetailPageContent({ slug }: { slug: string }) {
  const router = useRouter();
  const isLoggedIn = !!useAuthStore((s) => s.user);
  const { data: pub, isLoading, isError } = usePublicationBySlug(slug);
  const { data: related = [] } = useRelatedPublications(slug, 6);
  const doctorId = pub?.doctor?.id;
  const { data: doctorPubMeta } = usePublicPublications(
    doctorId ? { doctorId, limit: 1 } : undefined,
  );
  const trackDownload = useTrackPublicationDownload();
  const trackShare = useTrackPublicationShare();
  const bookmarkMutation = useTogglePublicationBookmark();

  const pdf = pub ? publicationPdfUrl(pub) : null;
  const cover = pub ? publicationCoverUrl(pub) : null;
  const doiLink = pub?.doiUrl ?? (pub?.doi ? `https://doi.org/${pub.doi}` : null);

  const doctorName = useMemo(() => {
    if (!pub?.doctor?.user) return "—";
    return `Dr. ${pub.doctor.user.firstName} ${pub.doctor.user.lastName}`;
  }, [pub]);

  const handleDownload = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    trackDownload.mutate(slug);
  };

  const handleShare = async () => {
    const url = window.location.href;
    trackShare.mutate(slug);
    if (navigator.share && pub) {
      await navigator.share({ title: pub.title, text: pub.abstract.slice(0, 120), url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const handleBookmark = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    bookmarkMutation.mutate(slug);
  };

  if (isLoading) {
    return (
      <div className="research-pub-detail">
        <div className="detail-loading">
          <p>Loading publication…</p>
        </div>
      </div>
    );
  }

  if (isError || !pub) {
    return (
      <div className="research-pub-detail">
        <div className="detail-error">
          <h1>Publication Not Found</h1>
          <p>This publication may be unpublished or no longer available.</p>
          <Link href="/research-publications" className="action-btn primary" style={{ display: "inline-flex", marginTop: 16 }}>
            ← Back to Research & Publications
          </Link>
        </div>
      </div>
    );
  }

  const doctor = pub.doctor;
  const initials = getInitials(doctor?.user?.firstName, doctor?.user?.lastName);
  const avatarBg = gradientForId(doctor?.id ?? pub.id);

  return (
    <div className="research-pub-detail">
      <div className="detail-breadcrumb">
        🏠 <Link href="/">Home</Link> › <Link href="/research-publications">Research & Publications</Link> ›{" "}
        <span>{pub.title.slice(0, 48)}{pub.title.length > 48 ? "…" : ""}</span>
      </div>

      <header className="detail-hero">
        <div className="detail-hero-inner">
          <div className="detail-tags">
            <span className="detail-tag">{PUBLICATION_TYPE_LABELS[pub.publicationType]}</span>
            {pub.medicalSpecialty ? <span className="detail-tag">{pub.medicalSpecialty}</span> : null}
            {pub.physicianReviewed ? <span className="detail-tag">✔ Physician-Reviewed</span> : null}
            {pub.openAccess ? <span className="detail-tag">🔓 Open Access</span> : null}
          </div>
          <h1>{pub.title}</h1>
          {pub.subtitle ? <p className="detail-subtitle">{pub.subtitle}</p> : null}
          <div className="detail-meta-row">
            {pub.journalName ? <span>📰 {pub.journalName}</span> : null}
            {pub.publicationDate ? <span>📅 {formatDate(pub.publicationDate)}</span> : null}
            {pub.doi ? <span>🔗 DOI: {pub.doi}</span> : null}
            <span>⏱️ {pub.readTimeMinutes} min read</span>
          </div>
        </div>
      </header>

      <div className="detail-layout">
        <main className="detail-main">
          {cover ? <img src={cover} alt="" className="cover-img" /> : null}

          <div className="stats-bar">
            <div className="stat-pill">
              <strong>{formatNumber(pub.viewCount)}</strong>
              <span>Views</span>
            </div>
            <div className="stat-pill">
              <strong>{formatNumber(pub.downloadCount)}</strong>
              <span>Downloads</span>
            </div>
            <div className="stat-pill">
              <strong>{formatNumber(pub.bookmarkCount ?? 0)}</strong>
              <span>Bookmarks</span>
            </div>
            <div className="stat-pill">
              <strong>{formatNumber(pub.citationCount)}</strong>
              <span>Citations</span>
            </div>
            <div className="stat-pill">
              <strong>{formatNumber(pub.shareCount)}</strong>
              <span>Shares</span>
            </div>
          </div>

          <div className="action-bar">
            {pdf ? (
              <button type="button" className="action-btn primary" onClick={() => handleDownload(pdf)}>
                ⬇ Download PDF
              </button>
            ) : null}
            {doiLink ? (
              <a href={doiLink} className="action-btn" target="_blank" rel="noopener noreferrer">
                View DOI
              </a>
            ) : null}
            <button type="button" className="action-btn" onClick={handleShare}>
              Share
            </button>
            <button type="button" className="action-btn" onClick={handleBookmark}>
              {pub.bookmarked ? "★ Bookmarked" : "☆ Bookmark"}
            </button>
          </div>

          <ContentSection title="Journal & Publication Details" icon="📚">
            <div className="journal-grid">
              <div className="journal-item">
                <label>Journal</label>
                <span>{pub.journalName ?? "—"}</span>
              </div>
              <div className="journal-item">
                <label>Publisher</label>
                <span>{pub.publisher ?? "—"}</span>
              </div>
              <div className="journal-item">
                <label>Volume / Issue</label>
                <span>
                  {pub.volume ?? "—"} / {pub.issue ?? "—"}
                </span>
              </div>
              <div className="journal-item">
                <label>Pages</label>
                <span>{pub.pages ?? "—"}</span>
              </div>
              <div className="journal-item">
                <label>DOI</label>
                {doiLink ? (
                  <a href={doiLink} target="_blank" rel="noopener noreferrer">
                    {pub.doi}
                  </a>
                ) : (
                  <span>{pub.doi ?? "—"}</span>
                )}
              </div>
              <div className="journal-item">
                <label>ISSN</label>
                <span>{pub.issn ?? "—"}</span>
              </div>
              <div className="journal-item">
                <label>Publication Date</label>
                <span>{pub.publicationDate ? formatDate(pub.publicationDate) : "—"}</span>
              </div>
              <div className="journal-item">
                <label>Status</label>
                <span>{PUBLICATION_STATUS_LABELS[pub.status]}</span>
              </div>
            </div>
          </ContentSection>

          <ContentSection title="Authors" icon="👥">
            <div className="author-list">
              {pub.authors?.length ? (
                pub.authors.map((author) => (
                  <div key={`${author.name}-${author.sortOrder}`} className={`author-row${author.isPrimary ? " primary" : ""}`}>
                    <div>
                      <div className="author-name">
                        {author.isPrimary && doctor ? (
                          <Link href={`/our-doctors/${doctor.id}`}>{author.name}</Link>
                        ) : (
                          author.name
                        )}
                      </div>
                      <div className="author-role">
                        {[author.role, author.affiliation, author.orcid ? `ORCID ${author.orcid}` : null]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="author-row primary">
                  <div>
                    <div className="author-name">
                      {doctor ? <Link href={`/our-doctors/${doctor.id}`}>{publicationAuthorsLine(pub)}</Link> : publicationAuthorsLine(pub)}
                    </div>
                    <div className="author-role">
                      {[pub.institution, pub.department, pub.orcid ? `ORCID ${pub.orcid}` : null].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ContentSection>

          <ContentSection title="Abstract" icon="📄">
            <p>{pub.abstract}</p>
          </ContentSection>

          {pub.introduction || pub.researchOverview ? (
            <ContentSection title="Introduction" icon="📖">
              <p>{pub.introduction ?? pub.researchOverview}</p>
            </ContentSection>
          ) : null}

          {pub.researchMethodology || pub.methodologySteps ? (
            <ContentSection title="Methodology" icon="🧪">
              <p style={{ whiteSpace: "pre-line" }}>{pub.researchMethodology ?? pub.methodologySteps}</p>
            </ContentSection>
          ) : null}

          {pub.studyDesign || pub.sampleSize ? (
            <ContentSection title="Study Design" icon="🔬">
              <p>
                <strong>Design:</strong> {pub.studyDesign ?? "—"}
                <br />
                <strong>Sample size:</strong> {pub.sampleSize ?? "—"}
                {pub.ethicalApprovalNumber ? (
                  <>
                    <br />
                    <strong>Ethical approval:</strong> {pub.ethicalApprovalNumber}
                  </>
                ) : null}
                {pub.clinicalTrialRegistration ? (
                  <>
                    <br />
                    <strong>Trial registration:</strong> {pub.clinicalTrialRegistration}
                  </>
                ) : null}
                {pub.fundingSource ? (
                  <>
                    <br />
                    <strong>Funding:</strong> {pub.fundingSource}
                  </>
                ) : null}
              </p>
            </ContentSection>
          ) : null}

          {pub.results ? (
            <ContentSection title="Results" icon="📊">
              <p>{pub.results}</p>
            </ContentSection>
          ) : null}

          {pub.discussion ? (
            <ContentSection title="Discussion" icon="💬">
              <p>{pub.discussion}</p>
            </ContentSection>
          ) : null}

          {pub.conclusion ? (
            <ContentSection title="Conclusion" icon="✅">
              <p>{pub.conclusion}</p>
            </ContentSection>
          ) : null}

          {pub.keywords?.length ? (
            <ContentSection title="Keywords" icon="🏷️">
              <div className="kw-row">
                {pub.keywords.map((kw) => (
                  <span key={kw.id ?? kw.keyword} className="kw-pill">
                    {kw.keyword}
                  </span>
                ))}
              </div>
            </ContentSection>
          ) : null}

          {(attachmentsByType(pub, "PDF").length > 0 ||
            attachmentsByType(pub, "FIGURE").length > 0 ||
            attachmentsByType(pub, "TABLE").length > 0 ||
            attachmentsByType(pub, "DATASET").length > 0 ||
            attachmentsByType(pub, "SUPPLEMENTARY").length > 0) && (
            <ContentSection title="Attachments" icon="📎">
              <div className="attach-grid">
                {attachmentsByType(pub, "PDF").map((a) => (
                  <button key={a.id ?? a.fileUrl} type="button" className="attach-btn" onClick={() => handleDownload(a.fileUrl)}>
                    📄 {a.fileName}
                  </button>
                ))}
                {attachmentsByType(pub, "FIGURE").map((a) => (
                  <a key={a.id ?? a.fileUrl} href={a.fileUrl} className="attach-btn" target="_blank" rel="noopener noreferrer">
                    🖼 {a.fileName}
                  </a>
                ))}
                {attachmentsByType(pub, "TABLE").map((a) => (
                  <a key={a.id ?? a.fileUrl} href={a.fileUrl} className="attach-btn" target="_blank" rel="noopener noreferrer">
                    📋 {a.fileName}
                  </a>
                ))}
                {attachmentsByType(pub, "DATASET").map((a) => (
                  <a key={a.id ?? a.fileUrl} href={a.fileUrl} className="attach-btn" target="_blank" rel="noopener noreferrer">
                    💾 {a.fileName}
                  </a>
                ))}
                {attachmentsByType(pub, "SUPPLEMENTARY").map((a) => (
                  <a key={a.id ?? a.fileUrl} href={a.fileUrl} className="attach-btn" target="_blank" rel="noopener noreferrer">
                    📎 {a.fileName}
                  </a>
                ))}
              </div>
            </ContentSection>
          )}

          {(pub.doiUrl || pub.journalUrl || pub.pubmedUrl || pub.googleScholarUrl) && (
            <ContentSection title="External Links" icon="🔗">
              <div className="attach-grid">
                {pub.doiUrl ? (
                  <a href={pub.doiUrl} className="attach-btn" target="_blank" rel="noopener noreferrer">
                    DOI Resolver
                  </a>
                ) : null}
                {pub.journalUrl ? (
                  <a href={pub.journalUrl} className="attach-btn" target="_blank" rel="noopener noreferrer">
                    Journal Website
                  </a>
                ) : null}
                {pub.pubmedUrl ? (
                  <a href={pub.pubmedUrl} className="attach-btn" target="_blank" rel="noopener noreferrer">
                    PubMed
                  </a>
                ) : null}
                {pub.googleScholarUrl ? (
                  <a href={pub.googleScholarUrl} className="attach-btn" target="_blank" rel="noopener noreferrer">
                    Google Scholar
                  </a>
                ) : null}
              </div>
            </ContentSection>
          )}
        </main>

        <aside className="detail-sidebar">
          {doctor ? (
            <div className="doctor-card">
              {doctor.user?.avatarUrl ? (
                <img src={doctor.user.avatarUrl} alt="" className="doctor-av" style={{ objectFit: "cover" }} />
              ) : (
                <div className="doctor-av" style={{ background: avatarBg }}>
                  {initials}
                </div>
              )}
              <h3>
                <Link href={`/our-doctors/${doctor.id}`}>{doctorName}</Link>
              </h3>
              <div className="doctor-spec">{doctor.specialty}</div>
              <div className="doctor-meta">
                {doctor.experienceYears ? `${doctor.experienceYears}+ years experience` : null}
                {doctorPubMeta?.meta.total ? (
                  <>
                    <br />
                    {doctorPubMeta.meta.total} approved publication{doctorPubMeta.meta.total === 1 ? "" : "s"}
                  </>
                ) : null}
                {doctor.hospital ? (
                  <>
                    <br />
                    {doctor.hospital}
                  </>
                ) : null}
                {doctor.city ? (
                  <>
                    <br />
                    {doctor.city}
                  </>
                ) : null}
              </div>
              <Link href={`/our-doctors/${doctor.id}`} className="sidebar-btn ghost">
                View Doctor Profile
              </Link>
              <Link href={`/book-consultation?doctorId=${doctor.id}`} className="sidebar-btn primary">
                Book Consultation
              </Link>
            </div>
          ) : null}

          {related.length > 0 && doctor ? (
            <div className="related-card">
              <div className="related-hd">More Research by {doctorName}</div>
              {related.map((item) => (
                <Link key={item.id} href={`/research-publications/${item.slug}`} className="related-item">
                  <h4>{item.title}</h4>
                  <span>
                    {item.journalName ?? PUBLICATION_TYPE_LABELS[item.publicationType]} · {pubYear(item)}
                  </span>
                </Link>
              ))}
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
