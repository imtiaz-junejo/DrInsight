import type { GlobalSeoSettings, SeoPageSetting } from "@/services/cms-api-hooks";

export function seoUrlCrumb(url: string) {
  return url.replace(/^https?:\/\//, "").split("/").filter(Boolean).join(" › ");
}

export function pageDefaultCanonical(siteUrl: string, path: string) {
  const base = siteUrl.replace(/\/+$/, "");
  return path === "/" ? `${base}/` : `${base}${path}`;
}

export function splitKeywords(keywords: string[]) {
  const focus = keywords[0] ?? "";
  const secondary = keywords.slice(1).join(", ");
  return { focus, secondary };
}

export function joinKeywords(focus: string, secondary: string) {
  const items = [focus.trim(), ...secondary.split(",").map((s) => s.trim()).filter(Boolean)].filter(Boolean);
  return Array.from(new Set(items));
}

export function buildPageSchema(
  page: Pick<SeoPageSetting, "pageName" | "metaTitle" | "metaDescription" | "canonicalUrl" | "metaKeywords" | "path">,
  siteUrl: string,
) {
  const url = page.canonicalUrl || pageDefaultCanonical(siteUrl, page.path);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    name: page.metaTitle || page.pageName,
    url,
    description: page.metaDescription ?? "",
    keywords: page.metaKeywords ?? [],
    isPartOf: { "@type": "WebSite", name: "The Dr Insight", url: siteUrl },
    publisher: { "@type": "MedicalOrganization", name: "The Dr Insight" },
  };
}

export function charCountLabel(value: string, max: number) {
  const len = value.length;
  const color = len > max ? "#dc2626" : "#059669";
  return { len, color, text: `${len}/${max}` };
}

export function downloadTextFile(filename: string, content: string, mime = "application/xml") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function globalDraftFromSettings(global?: GlobalSeoSettings) {
  const defaultSchema = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "MedicalOrganization",
      name: "The Dr Insight",
      url: "https://www.drinsight.org",
    },
    null,
    2,
  );
  return {
    siteTitle:
      global?.siteTitle ??
      "The Dr Insight — Trusted, Doctor-Reviewed Medical Information",
    defaultMetaTitleSuffix: global?.defaultMetaTitleSuffix ?? " | DrInsight",
    defaultMetaDescription: global?.defaultMetaDescription ?? "",
    defaultMetaKeywords: global?.defaultMetaKeywords ?? "health, doctor, medical advice",
    ogTitle: global?.ogTitle ?? "",
    ogDescription: global?.ogDescription ?? "",
    twitterHandle: global?.twitterHandle ?? "@drinsight",
    globalSchemaJson: global?.globalSchemaJson
      ? JSON.stringify(global.globalSchemaJson, null, 2)
      : defaultSchema,
    googleSearchConsole: global?.googleSearchConsole ?? "",
    googleAnalyticsId: global?.googleAnalyticsId ?? "",
    xmlSitemapUrl: global?.xmlSitemapUrl ?? "",
    robotsTxt: global?.robotsTxt ?? "",
    sitemapXml: global?.sitemapXml ?? "",
    siteUrl: global?.siteUrl ?? "https://drinsight.org",
    faviconUrl: global?.faviconUrl ?? "",
    socialSharingImageUrl: global?.socialSharingImageUrl ?? "",
  };
}
