const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export interface PublicSeoMeta {
  metaTitle?: string;
  metaDescription?: string | null;
  metaKeywords?: string[];
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageUrl?: string | null;
  twitterCard?: string | null;
  robots?: string | null;
  schemaJson?: Record<string, unknown> | null;
}

export async function fetchPublicSeo(path: string): Promise<PublicSeoMeta | null> {
  try {
    const res = await fetch(`${API_BASE}/site-admin/public/seo?path=${encodeURIComponent(path)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;

    const text = await res.text();
    if (!text.trim()) return null;

    const parsed = JSON.parse(text) as PublicSeoMeta | null;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function buildMetadataFromSeo(
  seo: PublicSeoMeta | null,
  fallback: { title: string; description?: string },
) {
  const title = seo?.metaTitle || fallback.title;
  const description = seo?.metaDescription || fallback.description;
  return {
    title,
    description,
    keywords: seo?.metaKeywords,
    alternates: seo?.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    robots: seo?.robots,
    openGraph: {
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      images: seo?.ogImageUrl ? [{ url: seo.ogImageUrl }] : undefined,
    },
    twitter: {
      card: (seo?.twitterCard as "summary" | "summary_large_image") || "summary_large_image",
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      images: seo?.ogImageUrl ? [seo.ogImageUrl] : undefined,
    },
  };
}
