"use client";

import { useEffect, useState } from "react";
import { AdminButton, FormGrid, FormItem } from "@/components/admin/ui/AdminPrimitives";
import type { SeoPageSetting } from "@/services/cms-api-hooks";

export function SeoEditorModal({
  page,
  onClose,
  onSave,
  onReset,
  saving,
}: {
  page: SeoPageSetting;
  onClose: () => void;
  onSave: (data: Partial<SeoPageSetting>) => void;
  onReset: () => void;
  saving?: boolean;
}) {
  const [form, setForm] = useState({
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription ?? "",
    metaKeywords: (page.metaKeywords ?? []).join(", "),
    canonicalUrl: page.canonicalUrl ?? "",
    slug: page.slug ?? "",
    ogTitle: page.ogTitle ?? "",
    ogDescription: page.ogDescription ?? "",
    ogImageUrl: page.ogImageUrl ?? "",
    twitterCard: page.twitterCard ?? "summary_large_image",
    robots: page.robots ?? "index,follow",
    schemaJson: page.schemaJson ? JSON.stringify(page.schemaJson, null, 2) : "",
    sitemapPriority: page.sitemapPriority ?? 0.5,
    status: page.status ?? "PUBLISHED",
  });

  useEffect(() => {
    setForm({
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription ?? "",
      metaKeywords: (page.metaKeywords ?? []).join(", "),
      canonicalUrl: page.canonicalUrl ?? "",
      slug: page.slug ?? "",
      ogTitle: page.ogTitle ?? "",
      ogDescription: page.ogDescription ?? "",
      ogImageUrl: page.ogImageUrl ?? "",
      twitterCard: page.twitterCard ?? "summary_large_image",
      robots: page.robots ?? "index,follow",
      schemaJson: page.schemaJson ? JSON.stringify(page.schemaJson, null, 2) : "",
      sitemapPriority: page.sitemapPriority ?? 0.5,
      status: page.status ?? "PUBLISHED",
    });
  }, [page]);

  const handleSave = () => {
    let schemaJson: Record<string, unknown> | undefined;
    if (form.schemaJson.trim()) {
      try {
        schemaJson = JSON.parse(form.schemaJson);
      } catch {
        alert("Invalid JSON-LD schema");
        return;
      }
    }
    onSave({
      metaTitle: form.metaTitle,
      metaDescription: form.metaDescription || undefined,
      metaKeywords: form.metaKeywords.split(",").map((k) => k.trim()).filter(Boolean),
      canonicalUrl: form.canonicalUrl || undefined,
      slug: form.slug || undefined,
      ogTitle: form.ogTitle || undefined,
      ogDescription: form.ogDescription || undefined,
      ogImageUrl: form.ogImageUrl || undefined,
      twitterCard: form.twitterCard,
      robots: form.robots,
      schemaJson,
      sitemapPriority: Number(form.sitemapPriority),
      status: form.status,
    });
  };

  const titleLen = form.metaTitle.length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 820 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-hd">
          <h3>SEO Editor — {page.pageName}</h3>
          <button type="button" className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-bd" style={{ maxHeight: "75vh", overflowY: "auto" }}>
          <p style={{ marginBottom: 12, fontSize: ".85rem", color: "var(--gray-500)" }}>
            Path: <code>{page.path}</code> · Title length: {titleLen} chars {titleLen <= 60 ? "✓" : "(consider shortening)"}
          </p>
          <FormGrid>
            <FormItem label="SEO Title" full>
              <input value={form.metaTitle} onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))} />
            </FormItem>
            <FormItem label="Meta Description" full>
              <textarea rows={3} value={form.metaDescription} onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))} />
            </FormItem>
            <FormItem label="Meta Keywords" full>
              <input value={form.metaKeywords} onChange={(e) => setForm((f) => ({ ...f, metaKeywords: e.target.value }))} />
            </FormItem>
            <FormItem label="Canonical URL" full>
              <input value={form.canonicalUrl} onChange={(e) => setForm((f) => ({ ...f, canonicalUrl: e.target.value }))} />
            </FormItem>
            <FormItem label="Slug">
              <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
            </FormItem>
            <FormItem label="Robots">
              <input value={form.robots} onChange={(e) => setForm((f) => ({ ...f, robots: e.target.value }))} />
            </FormItem>
            <FormItem label="Open Graph Title" full>
              <input value={form.ogTitle} onChange={(e) => setForm((f) => ({ ...f, ogTitle: e.target.value }))} />
            </FormItem>
            <FormItem label="Open Graph Description" full>
              <textarea rows={2} value={form.ogDescription} onChange={(e) => setForm((f) => ({ ...f, ogDescription: e.target.value }))} />
            </FormItem>
            <FormItem label="Open Graph Image URL" full>
              <input value={form.ogImageUrl} onChange={(e) => setForm((f) => ({ ...f, ogImageUrl: e.target.value }))} />
            </FormItem>
            <FormItem label="Twitter Card">
              <select value={form.twitterCard} onChange={(e) => setForm((f) => ({ ...f, twitterCard: e.target.value }))}>
                <option value="summary">summary</option>
                <option value="summary_large_image">summary_large_image</option>
              </select>
            </FormItem>
            <FormItem label="Sitemap Priority">
              <input
                type="number"
                min={0}
                max={1}
                step={0.1}
                value={form.sitemapPriority}
                onChange={(e) => setForm((f) => ({ ...f, sitemapPriority: Number(e.target.value) }))}
              />
            </FormItem>
            <FormItem label="Status">
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </FormItem>
            <FormItem label="Schema.org JSON-LD" full>
              <textarea rows={6} value={form.schemaJson} onChange={(e) => setForm((f) => ({ ...f, schemaJson: e.target.value }))} />
            </FormItem>
          </FormGrid>
        </div>
        <div className="modal-ft">
          <AdminButton variant="danger" onClick={onReset}>
            Reset
          </AdminButton>
          <AdminButton onClick={onClose}>Cancel</AdminButton>
          <AdminButton variant="primary" onClick={handleSave}>
            Save SEO
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
