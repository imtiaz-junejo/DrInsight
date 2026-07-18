"use client";

import { usePublicAdvertisements } from "@/services/configuration-api-hooks";

export function SiteAdBanner({ placement }: { placement: "banner" | "sidebar" | "inarticle" }) {
  const adsQuery = usePublicAdvertisements();
  const html = adsQuery.data?.[placement];
  if (!html?.trim()) return null;

  return (
    <div
      className={`site-ad site-ad-${placement}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function SiteAdSenseScript() {
  const adsQuery = usePublicAdvertisements();
  const code = adsQuery.data?.adsense?.trim();
  if (!code) return null;

  return (
    <div
      className="site-adsense-root"
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
}
