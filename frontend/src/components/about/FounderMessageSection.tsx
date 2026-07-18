"use client";

import {
  SectionEyebrow,
  SectionTitle,
} from "@/components/public/section-heading";

export type FounderMessageSectionData = {
  founderName: string;
  designation: string;
  imageUrl?: string | null;
  headline: string;
  messageHtml: string;
  signatureImageUrl?: string | null;
  videoUrl?: string | null;
  eyebrow?: string | null;
  subline?: string | null;
  badgeText?: string | null;
  credentials?: Array<{ icon: string; text: string }> | null;
  tags?: string[];
  signatureName?: string | null;
  signatureTitle?: string | null;
  locationLine?: string | null;
};

export function FounderMessageSection({ data }: { data: FounderMessageSectionData }) {
  const credentials = data.credentials ?? [];
  const tags = data.tags ?? [];

  return (
    <div className="founder-section">
      <div className="founder-inner">
        <div className="founder-left">
          <div className="founder-avatar-wrap">
            <div className="founder-avatar">
              {data.imageUrl ? (
                <img
                  src={data.imageUrl}
                  alt={data.founderName}
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                />
              ) : (
                "👨‍⚕️"
              )}
            </div>
            {data.badgeText ? <div className="founder-badge">{data.badgeText}</div> : null}
          </div>
          <div className="founder-name">{data.founderName || "Founder Name"}</div>
          <div className="founder-title">{data.designation || "Designation"}</div>
          {data.subline ? <div className="founder-sub">{data.subline}</div> : null}
          <div className="founder-credentials">
            {credentials.length > 0 ? (
              credentials.map((cred) => (
                <div key={cred.text} className="cred-item">
                  <span>{cred.icon}</span>
                  {cred.text}
                </div>
              ))
            ) : (
              <div className="cred-item">
                <span>🩺</span>
                Credentials coming soon
              </div>
            )}
          </div>
          {tags.length > 0 ? (
            <div className="founder-tags" style={{ marginTop: 16, justifyContent: "center" }}>
              {tags.map((tag) => (
                <span key={tag} className="founder-tag">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="founder-right">
          <div className="founder-message">
            <SectionEyebrow className="eyebrow">
              {data.eyebrow ?? "A Message from Our Founder"}
            </SectionEyebrow>
            <div className="founder-quote-mark">&quot;</div>
            <SectionTitle>{data.headline || "Headline"}</SectionTitle>
            {data.messageHtml ? (
              <div dangerouslySetInnerHTML={{ __html: data.messageHtml }} />
            ) : (
              <p style={{ color: "var(--gray-500)" }}>Your message will appear here.</p>
            )}
            {data.videoUrl ? (
              <div style={{ marginTop: 20 }}>
                <a href={data.videoUrl} target="_blank" rel="noopener noreferrer" className="btn-blue">
                  ▶ Watch Founder Video
                </a>
              </div>
            ) : null}
            <div className="founder-signature">
              {data.signatureImageUrl ? (
                <img
                  src={data.signatureImageUrl}
                  alt="Signature"
                  style={{ height: 48, objectFit: "contain" }}
                />
              ) : (
                <div className="sig-icon">✚</div>
              )}
              <div className="sig-text">
                <strong>{data.signatureName ?? data.founderName}</strong>
                {data.signatureTitle ? <span>{data.signatureTitle}</span> : null}
                {data.locationLine ? (
                  <span style={{ fontSize: "0.74rem", color: "var(--blue)", marginTop: 2, display: "block" }}>
                    {data.locationLine}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
