"use client";

import {
  resolveDoctorEducationHistory,
  textToAwards,
  textToCerts,
  textToLectures,
} from "@/lib/doctor-profile-form";
import { formatStatCount, specialtyEmoji } from "@/lib/data-mappers";
import type { AdminDoctorProfileFormValues } from "@/lib/admin-doctor-profile-schema";
import type { DoctorProfile } from "@/services/api-hooks";
import "@/styles/admin-doctor-bio-preview.css";

interface Props {
  values: AdminDoctorProfileFormValues;
  doctor?: DoctorProfile | null;
  suspended?: boolean;
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
function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return formatStatCount(n);
}

function SectionTitle({
  icon,
  label,
  adminOnly,
}: {
  icon: string;
  label: string;
  adminOnly?: boolean;
}) {
  return (
    <div className="s-title">
      {icon} {label}
      {adminOnly ? (
        <span style={{ fontSize: ".68rem", fontWeight: 500, color: "var(--gray-400)", border: "none" }}>
          (admin-controlled)
        </span>
      ) : null}
    </div>
  );
}

export function AdminDoctorBioPreview({ values, doctor, suspended }: Props) {
  const verified = Boolean(doctor?.credentialsVerifiedAt) && !suspended;
  const expertise = (values.expertise ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const education = resolveDoctorEducationHistory({
    education: values.education,
    educationHistory: doctor?.educationHistory,
  });
  const boardCerts = textToCerts(values.boardCerts ?? "");
  const awards = textToAwards(values.awards ?? "");
  const lectures = textToLectures(values.lectures ?? "");

  const articleCount = doctor?.articleStats?.count ?? doctor?.articles?.length ?? 0;
  const totalViews = doctor?.articleStats?.totalViews ?? 0;
  const consultations = doctor?.consultationCount ?? doctor?.patientsTreated ?? 0;
  const commentCount = doctor?.commentCount ?? doctor?.reviewCount ?? 0;
  const rating = doctor?.rating ?? 0;

  const stats = {
    articles: formatStatCount(articleCount),
    views: formatViews(totalViews),
    rating: rating > 0 ? `${rating.toFixed(1)} ★` : "—",
    consultations: formatStatCount(consultations),
    reviews: formatStatCount(commentCount),
  };

  const socials = [
    ["facebook", "📘 Facebook", "#1877f2", values.facebook],
    ["twitter", "𝕏 Twitter", "#0f1419", values.twitter],
    ["youtube", "▶️ YouTube", "#ff0000", values.youtube],
    ["instagram", "📷 Instagram", "#e1306c", values.instagram],
    ["linkedin", "🔗 LinkedIn", "#0a66c2", values.linkedin],
  ].filter((item) => (item[3] ?? "").trim());

  const bookingEnabled = doctor?.bookingEnabled !== false;
  const contactEnabled = doctor?.contactEnabled !== false;
  const specLabel = values.specLabel || `${specialtyEmoji(values.specialty)} ${values.specialty}`;
  const photoIcon = values.photoIcon || specialtyEmoji(values.specialty) || "👨‍⚕️";
  const locationParts = values.location?.split(",").map((part) => part.trim()).filter(Boolean) ?? [];
  const locationLabel =
    [doctor?.city, doctor?.country].filter(Boolean).join(", ") ||
    values.location ||
    locationParts.join(", ");
  const countryName = doctor?.country || locationParts[locationParts.length - 1] || "";
  const headlineTitle = values.title || (values.specialty ? `Consultant ${values.specialty}` : "");
  const hospitalLine =
    headlineTitle && values.institution
      ? `${headlineTitle} — ${values.institution}`
      : headlineTitle || values.institution || "";
  return (
    <div className="abio">
      <div className="hero-banner">
        <div className="hero-inner">
          <div className="hero-av-wrap">
            <div className="hero-photo">
              {values.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={values.avatarUrl} alt={values.fullName} />
              ) : (
                photoIcon
              )}
            </div>
            {verified ? (
              <div className="hero-verified-ring" aria-label="Verified">
                ✓
              </div>
            ) : null}
          </div>

          <div className="hero-eyebrow">
            {verified ? <span className="hero-badge verified">✅ Medically Verified Author</span> : null}
            <span className="hero-badge">{specLabel}</span>
            <span className="hero-badge">🏥 DrInsight Editorial Board</span>
          </div>

          <h1 className="hero-name-line">
            {values.fullName || "Doctor Name"}
            {values.credentials?.trim() ? (
              <span className="hero-name-creds"> {values.credentials.trim()}</span>
            ) : null}
          </h1>

          <div className="hero-meta">
            {hospitalLine ? <div className="hero-meta-item">🏥 {hospitalLine}</div> : null}
            {locationLabel ? (
              <div className="hero-meta-item">
                📍 {countryFlag(countryName)} {locationLabel}
              </div>
            ) : null}
            <div className="hero-meta-item">⏳ {values.experience || "—"} Years in Practice</div>
          </div>

          <div className="hero-stats">
              {[
                ["articles", "Articles"],
                ["views", "Total Views"],
                ["rating", "Avg. Rating"],
                ["consultations", "Consultations"],
                ["reviews", "Comments"],
              ].map(([key, label]) => (
                <div className="hero-stat" key={key}>
                  <strong>{stats[key as keyof typeof stats] || "—"}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <div className="action-btns">
              {bookingEnabled ? (
                <button type="button" className="action-btn primary">
                  📅 Book Consultation
                </button>
              ) : null}
              {contactEnabled ? (
                <button type="button" className="action-btn outline">
                  📧 Contact Author
                </button>
              ) : null}
            </div>
        </div>
      </div>

      <div className="abio-body">
        <div className="callout-box">
          <p>
            ⚕️ <strong>Medical Disclaimer:</strong> The information on this page is for educational purposes only.
            Booking a consultation is for professional medical advice tailored to your specific condition.
          </p>
        </div>

        <div className="s-card">
          <SectionTitle icon="👤" label={`About ${values.fullName || "the doctor"}`} />
          {values.bioShort ? (
            <p style={{ fontSize: ".86rem", color: "var(--gray-700)", lineHeight: 1.7, marginBottom: 8 }}>
              {values.bioShort}
            </p>
          ) : null}
          {values.bioFull ? (
            <p style={{ fontSize: ".84rem", color: "var(--gray-500)", lineHeight: 1.7 }}>{values.bioFull}</p>
          ) : null}
        </div>

        {expertise.length ? (
          <div className="s-card">
            <SectionTitle icon="🩺" label="Areas of Expertise" />
            <div className="exp-tags">
              {expertise.map((tag) => (
                <span className="exp-tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {education.length ? (
          <div className="s-card">
            <SectionTitle icon="🎓" label="Education & Training" />
            <div className="timeline">
              {education.map((item, index) => (
                <div className="tl-item" key={`${item.title}-${index}`}>
                  <div className="tl-dot">🎓</div>
                  <div>
                    {item.year ? <div className="tl-year">{item.year}</div> : null}
                    <div className="tl-title">{item.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {boardCerts.length ? (
          <div className="s-card">
            <SectionTitle icon="🏅" label="Board Certifications & Professional Memberships" />
            <div className="cert-grid">
              {boardCerts.map((cert, index) => (
                <div className="cert-card" key={`${cert.title}-${index}`}>
                  <div className="cert-ico">{cert.icon || "🏅"}</div>
                  <div>
                    <h4>{cert.title}</h4>
                    <p>{cert.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {awards.length ? (
          <div className="s-card">
            <SectionTitle icon="🏆" label="Awards & Honors" />
            <div className="award-list">
              {awards.map((award, index) => (
                <div className="award-item" key={`${award.title}-${index}`}>
                  <div className="award-ico">{award.icon || "🏆"}</div>
                  <div>
                    <h4>{award.title}</h4>
                    <p>
                      {award.organization}
                      {award.year ? ` · ${award.year}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {lectures.length ? (
          <div className="s-card">
            <SectionTitle icon="🎤" label="Lectures, Conferences & Teaching" />
            {lectures.map((lecture, index) => {
              const typeClass = /conference/i.test(lecture.type)
                ? "speak-conference"
                : /webinar/i.test(lecture.type)
                  ? "speak-webinar"
                  : "speak-lecture";
              return (
                <div className="speak-item" key={`${lecture.title}-${index}`}>
                  <h4>{lecture.title}</h4>
                  <p>{lecture.venue}</p>
                  {lecture.type || lecture.year ? (
                    <span className={`speak-type ${typeClass}`}>
                      {[lecture.type, lecture.year].filter(Boolean).join(" · ")}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}

        {values.roleAuthorSince || values.roleReviewerFor || values.roleEditorialBoard ? (
          <div className="s-card">
            <SectionTitle icon="✍️" label="Role at DrInsight" adminOnly />
            <div className="role-grid">
              <div className="role-item">
                <h4>Author Since</h4>
                <p>{values.roleAuthorSince || "—"}</p>
              </div>
              <div className="role-item">
                <h4>Articles Published</h4>
                <p>{stats.articles}</p>
              </div>
              <div className="role-item" style={{ gridColumn: "1 / -1" }}>
                <h4>Medical Reviewer For</h4>
                <p>{values.roleReviewerFor || "—"}</p>
              </div>
              <div className="role-item" style={{ gridColumn: "1 / -1" }}>
                <h4>Editorial Board</h4>
                <p>{values.roleEditorialBoard || "—"}</p>
              </div>
            </div>
          </div>
        ) : null}

        {values.coiDeclaration ? (
          <div className="s-card">
            <SectionTitle icon="💰" label="Conflict of Interest Disclosure" adminOnly />
            <div className="coi-box">
              <p>
                <strong>Declaration:</strong> {values.coiDeclaration}
              </p>
              {values.coiUpdated ? <p>Disclosure last updated: {values.coiUpdated}</p> : null}
            </div>
          </div>
        ) : null}

        {contactEnabled && socials.length ? (
          <div className="s-card">
            <SectionTitle icon="🔗" label="Social Media" />
            <div>
              {socials.map(([key, label, color, href]) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: ".78rem",
                    fontWeight: 600,
                    color,
                    background: "var(--gray-50)",
                    border: "1px solid var(--gray-200)",
                    borderRadius: 50,
                    padding: "6px 12px",
                    margin: "0 8px 8px 0",
                  }}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
