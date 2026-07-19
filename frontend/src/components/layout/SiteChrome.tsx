"use client";

import { Footer } from "./Footer";
import { SiteAdBanner, SiteAdSenseScript } from "./SiteAdvertisements";
import { PublicAdvertisementsProvider } from "./PublicAdvertisementsProvider";
import { SiteHeader } from "./SiteHeader";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <PublicAdvertisementsProvider>
      <SiteAdSenseScript />
      <SiteHeader />
      <SiteAdBanner placement="banner" />
      <main className="flex-1">{children}</main>
      <Footer />
    </PublicAdvertisementsProvider>
  );
}
