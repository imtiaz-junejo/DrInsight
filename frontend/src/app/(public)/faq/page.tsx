import { FaqPageContent } from "@/components/pages/FaqPageContent";
import { buildMetadataFromSeo, fetchPublicSeo } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await fetchPublicSeo("/faq");
  return buildMetadataFromSeo(seo, {
    title: "FAQ – Frequently Asked Questions | DrInsight",
    description:
      "Find answers to common questions about DrInsight's medical consultations, health tools, privacy, billing, and more.",
  });
}

export default function FAQPage() {
  return <FaqPageContent />;
}
