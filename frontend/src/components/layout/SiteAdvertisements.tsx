"use client";

import { usePublicAdvertisementsData } from "@/components/layout/PublicAdvertisementsProvider";

export function SiteAdBanner({ placement }: { placement: "banner" | "sidebar" | "inarticle" }) {
  const ads = usePublicAdvertisementsData();
  const html = ads?.[placement];
  if (!html?.trim()) return null;

  return (
    <div
      className={`site-ad site-ad-${placement}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function SiteAdSenseScript() {
  const ads = usePublicAdvertisementsData();
  const code = ads?.adsense?.trim();
  if (!code) return null;

  return (
    <div
      className="site-adsense-root"
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
}
