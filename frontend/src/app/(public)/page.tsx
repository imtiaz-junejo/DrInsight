import { HomePageContent } from "@/components/pages/HomePageContent";
import { buildMetadataFromSeo, fetchPublicSeo } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await fetchPublicSeo("/");
  return buildMetadataFromSeo(seo, {
    title: "DrInsight — Trusted, Doctor-Reviewed Medical Information",
    description:
      "Evidence-based medical information reviewed by board-certified physicians. Book consultations, use health tools, and read expert articles.",
  });
}

export default function HomePage() {
  return <HomePageContent />;
}
