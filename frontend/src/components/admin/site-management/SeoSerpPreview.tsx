"use client";

import { seoUrlCrumb } from "@/components/admin/site-management/seo-settings-utils";

export function SeoSerpPreview({
  title,
  url,
  description,
  focus,
  secondary,
}: {
  title: string;
  url: string;
  description: string;
  focus: string;
  secondary: string;
}) {
  return (
    <div className="seo-serp">
      <div className="seo-serp-kicker">🔎 Google Search Preview</div>
      <div className="seo-serp-title">{title || "Page title preview"}</div>
      <div className="seo-serp-url">{seoUrlCrumb(url)}</div>
      <div className="seo-serp-desc">{description}</div>
      <div className="seo-serp-kw">
        Focus: <strong>{focus || "—"}</strong>
        {secondary ? ` · Secondary: ${secondary}` : ""}
      </div>
    </div>
  );
}

export function SeoCharCount({ value, max }: { value: string; max: number }) {
  const len = value.length;
  const color = len > max ? "#dc2626" : "#059669";
  return (
    <span style={{ fontWeight: 400, color }}>
      {len}/{max}
    </span>
  );
}
