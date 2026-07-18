import { buildMetadataFromSeo, fetchPublicSeo } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await fetchPublicSeo("/contact");
  return buildMetadataFromSeo(seo, {
    title: "Contact DrInsight — Get in Touch With Our Team",
    description: "Contact DrInsight for medical enquiries, booking support, partnerships, and technical assistance.",
  });
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
