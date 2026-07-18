"use client";

import { SectionHeading } from "@/components/public/section-heading";
import { resolvePartnerDisplay } from "@/lib/partner-category";

export type PartnerMarqueeItem = {
  id: string;
  companyName: string;
  description?: string | null;
  logoUrl?: string | null;
};

export function TrustedPartnersMarquee({
  partners,
  showHeader = true,
  animate = true,
}: {
  partners: PartnerMarqueeItem[];
  showHeader?: boolean;
  animate?: boolean;
}) {
  const tiles = partners.length > 0 ? (animate ? [...partners, ...partners] : partners) : [];

  return (
    <section className="partners-section">
      {showHeader ? (
        <div className="section-inner">
          <SectionHeading
            className="section-header"
            eyebrow="Trusted Partners & Affiliates"
            title="Platforms & Resources We Work With"
            description="We collaborate with leading healthcare platforms, research institutions, and technology partners to deliver the highest standard of medical care."
          />
        </div>
      ) : null}
      <div className="marquee-track-wrap">
        {partners.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--gray-500)", padding: "24px 20px" }}>
            No partners to display yet.
          </p>
        ) : (
          <div className={`marquee-track${animate ? "" : " marquee-track-static"}`}>
            {tiles.map((partner, i) => {
              const { icon, logoUrl, badgeClass, badgeLabel } = resolvePartnerDisplay(partner);
              return (
                <div key={`${partner.id}-${i}`} className="partner-tile">
                  {logoUrl ? (
                    <img src={logoUrl} alt={partner.companyName} className="partner-tile-logo" />
                  ) : (
                    <span className="partner-tile-icon">{icon}</span>
                  )}
                  <span className="partner-tile-name">{partner.companyName}</span>
                  <span className={`partner-badge ${badgeClass}`}>{badgeLabel}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
