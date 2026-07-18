"use client";

import { useEffect, useState } from "react";
import { AdminButton, FormGrid, FormItem } from "@/components/admin/ui/AdminPrimitives";
import type { HealthToolItem } from "@/services/cms-api-hooks";

const CATEGORIES = ["General", "Fitness", "Nutrition", "Women's Health", "Cardiology", "Mental Health", "Screening"];

export function HealthToolEditor({
  tool,
  onClose,
  onSave,
  onDelete,
  saving,
}: {
  tool: HealthToolItem;
  onClose: () => void;
  onSave: (data: Partial<HealthToolItem>) => void;
  onDelete?: () => void;
  saving?: boolean;
}) {
  const [form, setForm] = useState({
    name: tool.name,
    slug: tool.slug,
    description: tool.description ?? "",
    iconEmoji: tool.iconEmoji ?? "🧮",
    category: tool.category ?? "General",
    route: tool.route ?? `/health-tools#${tool.slug}`,
    isActive: tool.isActive,
    featured: tool.featured ?? false,
    seoTitle: tool.seoTitle ?? "",
    seoDescription: tool.seoDescription ?? "",
    metaKeywords: (tool.metaKeywords ?? []).join(", "),
    settingsJson: JSON.stringify(tool.settings ?? {}, null, 2),
  });

  useEffect(() => {
    setForm({
      name: tool.name,
      slug: tool.slug,
      description: tool.description ?? "",
      iconEmoji: tool.iconEmoji ?? "🧮",
      category: tool.category ?? "General",
      route: tool.route ?? `/health-tools#${tool.slug}`,
      isActive: tool.isActive,
      featured: tool.featured ?? false,
      seoTitle: tool.seoTitle ?? "",
      seoDescription: tool.seoDescription ?? "",
      metaKeywords: (tool.metaKeywords ?? []).join(", "),
      settingsJson: JSON.stringify(tool.settings ?? {}, null, 2),
    });
  }, [tool]);

  const handleSave = () => {
    let settings: Record<string, unknown> | undefined;
    try {
      settings = form.settingsJson.trim() ? JSON.parse(form.settingsJson) : undefined;
    } catch {
      alert("Invalid JSON in tool settings");
      return;
    }
    onSave({
      name: form.name,
      description: form.description,
      iconEmoji: form.iconEmoji,
      category: form.category,
      route: form.route,
      isActive: form.isActive,
      featured: form.featured,
      seoTitle: form.seoTitle || undefined,
      seoDescription: form.seoDescription || undefined,
      metaKeywords: form.metaKeywords.split(",").map((k) => k.trim()).filter(Boolean),
      settings,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-hd">
          <h3>Edit Health Tool</h3>
          <button type="button" className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-bd" style={{ maxHeight: "75vh", overflowY: "auto" }}>
          <FormGrid>
            <FormItem label="Name" full>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </FormItem>
            <FormItem label="Slug">
              <input value={form.slug} disabled />
            </FormItem>
            <FormItem label="Icon">
              <input value={form.iconEmoji} onChange={(e) => setForm((f) => ({ ...f, iconEmoji: e.target.value }))} />
            </FormItem>
            <FormItem label="Category">
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FormItem>
            <FormItem label="Route" full>
              <input value={form.route} onChange={(e) => setForm((f) => ({ ...f, route: e.target.value }))} />
            </FormItem>
            <FormItem label="Description" full>
              <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </FormItem>
            <FormItem label="SEO Title" full>
              <input value={form.seoTitle} onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))} />
            </FormItem>
            <FormItem label="Meta Description" full>
              <textarea rows={2} value={form.seoDescription} onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))} />
            </FormItem>
            <FormItem label="Keywords (comma-separated)" full>
              <input value={form.metaKeywords} onChange={(e) => setForm((f) => ({ ...f, metaKeywords: e.target.value }))} />
            </FormItem>
            <FormItem label="Enabled">
              <label className="switch" style={{ marginTop: 8 }}>
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
                <span className="slider" />
              </label>
            </FormItem>
            <FormItem label="Featured">
              <label className="switch" style={{ marginTop: 8 }}>
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} />
                <span className="slider" />
              </label>
            </FormItem>
            <FormItem label="Tool Settings (JSON)" full>
              <textarea rows={5} value={form.settingsJson} onChange={(e) => setForm((f) => ({ ...f, settingsJson: e.target.value }))} />
            </FormItem>
          </FormGrid>
        </div>
        <div className="modal-ft">
          {onDelete ? (
            <AdminButton variant="danger" onClick={onDelete}>
              Delete
            </AdminButton>
          ) : null}
          <AdminButton onClick={onClose}>Cancel</AdminButton>
          <AdminButton variant="primary" onClick={handleSave}>
            Save Tool
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
