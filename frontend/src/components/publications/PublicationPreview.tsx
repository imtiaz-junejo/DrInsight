"use client";

import {
  PUBLICATION_TYPE_LABELS,
  type PublicationType,
} from "@/services/publications-api-hooks";

const PUBLICATION_TYPE_TAG_CLASS: Record<PublicationType, string> = {
  JOURNAL_ARTICLE: "ptag-clin",
  RESEARCH_PAPER: "ptag-review",
  CASE_STUDY: "ptag-meta",
  CLINICAL_TRIAL: "ptag-guide",
  REVIEW_ARTICLE: "ptag-review",
  CONFERENCE_PAPER: "ptag-clin",
  BOOK_CHAPTER: "ptag-meta",
  THESIS: "ptag-guide",
};

const PUB_AV_COLORS = [
  "linear-gradient(135deg,#1a56a0,#0891b2)",
  "linear-gradient(135deg,#7c3aed,#a78bfa)",
  "linear-gradient(135deg,#059669,#34d399)",
  "linear-gradient(135deg,#dc2626,#f87171)",
  "linear-gradient(135deg,#d97706,#fbbf24)",
  "linear-gradient(135deg,#db2777,#f472b6)",
];

export interface PublicationPreviewAuthor {
  name: string;
  role?: string | null;
  isPrimary?: boolean;
}

export interface PublicationPreviewTeamMember {
  name: string;
  role?: string | null;
}

export interface PublicationPreviewData {
  title?: string;
  subtitle?: string;
  abstract?: string;
  authors?: PublicationPreviewAuthor[];
  publicationType?: PublicationType;
  medicalSpecialty?: string;
  publicationDate?: string;
  physicianReviewed?: boolean;
  evidenceBased?: boolean;
  openAccess?: boolean;
  fullyReferenced?: boolean;
  coiDisclosed?: boolean;
  referenceCount?: number | null;
  readTimeMinutes?: number | null;
  journalName?: string | null;
  doi?: string | null;
  reviewingPhysician?: string | null;
  researchOverview?: string | null;
  methodologySteps?: string | null;
  teamMembers?: PublicationPreviewTeamMember[];
  partners?: string | null;
  keywords?: string[];
}

function pubInitials(name: string): string {
  const parts = name
    .trim()
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  return ((parts[0][0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

function fmtPubDate(value?: string): string {
  if (!value) return "";
  const parts = value.split("-");
  if (parts.length < 2) return value;
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthIndex = parseInt(parts[1], 10) - 1;
  return `${months[monthIndex] ?? ""} ${parts[0]}`;
}

function resolveAuthors(data: PublicationPreviewData) {
  const authors = data.authors?.filter((a) => a.name?.trim()) ?? [];
  const primary = authors.find((a) => a.isPrimary) ?? authors[0];
  const coAuthors = authors.filter((a) => a !== primary && a.name?.trim());
  return { primary, coAuthors };
}

export function PublicationPreview({ data }: { data: PublicationPreviewData }) {
  const type = data.publicationType ?? "RESEARCH_PAPER";
  const typeLabel = PUBLICATION_TYPE_LABELS[type];
  const tagClass = PUBLICATION_TYPE_TAG_CLASS[type];
  const { primary, coAuthors } = resolveAuthors(data);

  const methodologySteps = (data.methodologySteps ?? "")
    .split("\n")
    .map((step) => step.trim())
    .filter(Boolean);

  const teamMembers =
    data.teamMembers?.filter((member) => member.name?.trim() || member.role?.trim()) ??
    [];

  const partners = (data.partners ?? "")
    .split(",")
    .map((partner) => partner.trim())
    .filter(Boolean);

  const keywords = data.keywords?.filter(Boolean) ?? [];

  return (
    <div className="pubprev-wrap">
      <div className="pubprev-card">
        <div className="pubprev-top">
          <span className={`pubprev-tag ${tagClass}`}>{typeLabel}</span>
          {data.physicianReviewed ? (
            <span className="pubprev-rev">✔ Physician-Reviewed</span>
          ) : null}
          {data.publicationDate ? (
            <span className="pubprev-date">{fmtPubDate(data.publicationDate)}</span>
          ) : null}
        </div>

        <h4>{data.title?.trim() || "Untitled publication"}</h4>
        {data.subtitle?.trim() ? (
          <p style={{ fontSize: "0.82rem", color: "var(--gray-500)", marginBottom: 6 }}>{data.subtitle}</p>
        ) : null}

        <div className="pubprev-authors">
          {primary?.name ? <em>{primary.name}</em> : <em>Author</em>}
          {coAuthors.length > 0 ? (
            <>, {coAuthors.map((author) => author.name).join(", ")}</>
          ) : null}
          {data.reviewingPhysician?.trim() ? (
            <> · Reviewed by {data.reviewingPhysician}</>
          ) : null}
        </div>

        <div className="pubprev-abstract">{data.abstract || ""}</div>

        <div className="pubprev-foot">
          {data.referenceCount != null && data.referenceCount > 0 ? (
            <span>📚 {data.referenceCount} references</span>
          ) : null}
          {data.readTimeMinutes != null && data.readTimeMinutes > 0 ? (
            <span>⏱️ {data.readTimeMinutes} min read</span>
          ) : null}
          {data.openAccess ? <span>🔓 Open access</span> : null}
          {data.evidenceBased ? <span>🧬 Evidence-based</span> : null}
          {data.fullyReferenced ? <span>🔗 Fully referenced</span> : null}
          {data.journalName?.trim() ? <span>📖 {data.journalName}</span> : null}
          {data.doi?.trim() ? <span>DOI: {data.doi}</span> : null}
          <span className="pf-link">Read full publication →</span>
        </div>
      </div>

      {data.medicalSpecialty?.trim() ? (
        <div className="pubprev-sec">
          <h5>🎯 Focus Area</h5>
          <div className="pubprev-tags">
            <span className="pubprev-tagitem">{data.medicalSpecialty}</span>
          </div>
        </div>
      ) : null}

      {keywords.length > 0 ? (
        <div className="pubprev-sec">
          <h5>🏷️ Keywords</h5>
          <div className="pubprev-tags">
            {keywords.map((keyword) => (
              <span key={keyword} className="pubprev-tagitem">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {data.researchOverview?.trim() ? (
        <div className="pubprev-sec">
          <h5>🔬 Research Overview</h5>
          <p className="pubprev-sec-p">{data.researchOverview}</p>
        </div>
      ) : null}

      {methodologySteps.length > 0 ? (
        <div className="pubprev-sec">
          <h5>🧪 Methodology</h5>
          <div className="pubprev-steps">
            {methodologySteps.map((step, index) => (
              <div key={`${index}-${step}`} className="pubprev-step">
                <span className="pubprev-stepn">{index + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {teamMembers.length > 0 ? (
        <div className="pubprev-sec">
          <h5>👥 Research Team</h5>
          <div className="pubprev-team">
            {teamMembers.map((member, index) => (
              <div key={`${member.name}-${index}`} className="pubprev-member">
                <div
                  className="pubprev-mav"
                  style={{ background: PUB_AV_COLORS[index % PUB_AV_COLORS.length] }}
                >
                  {pubInitials(member.name || "—")}
                </div>
                <div className="pubprev-mname">{member.name || "—"}</div>
                {member.role?.trim() ? <div className="pubprev-mrole">{member.role}</div> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {partners.length > 0 ? (
        <div className="pubprev-sec">
          <h5>🤝 Partners &amp; Collaborators</h5>
          <div className="pubprev-tags">
            {partners.map((partner) => (
              <span key={partner} className="pubprev-tagitem">
                {partner}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
