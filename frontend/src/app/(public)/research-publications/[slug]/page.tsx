import type { Metadata } from "next";
import { PublicationDetailPageContent } from "@/components/pages/PublicationDetailPageContent";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

async function fetchPublication(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/publications/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pub = await fetchPublication(slug);
  if (!pub) {
    return { title: "Publication Not Found — DrInsight" };
  }

  const cover = pub.attachments?.find((a: { type: string }) => a.type === "COVER_IMAGE")?.fileUrl;

  return {
    title: pub.seoTitle || `${pub.title} — DrInsight Research`,
    description: pub.metaDescription || pub.abstract?.slice(0, 160),
    openGraph: {
      title: pub.seoTitle || pub.title,
      description: pub.metaDescription || pub.abstract?.slice(0, 160),
      type: "article",
      publishedTime: pub.publishedAt ?? undefined,
      modifiedTime: pub.updatedAt ?? undefined,
      images: cover ? [{ url: cover, alt: pub.title }] : undefined,
    },
  };
}

export default async function PublicationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PublicationDetailPageContent slug={slug} />;
}
