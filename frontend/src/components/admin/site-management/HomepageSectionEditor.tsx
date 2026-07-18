"use client";

import { useEffect, useState } from "react";
import { AdminButton, FormGrid, FormItem } from "@/components/admin/ui/AdminPrimitives";
import { ContentStatusBadge } from "@/components/admin/site-management/ContentStatusBadge";
import type { HomepageSection, HomepageSectionConfig } from "@/services/cms-api-hooks";

type ButtonItem = NonNullable<HomepageSectionConfig["buttons"]>[number];

export function HomepageSectionEditor({
  section,
  onClose,
  onSaveDraft,
  onPublish,
  onRevert,
  saving,
}: {
  section: HomepageSection;
  onClose: () => void;
  onSaveDraft: (data: { title?: string; isVisible?: boolean; draftConfig?: HomepageSectionConfig }) => void;
  onPublish: () => void;
  onRevert: () => void;
  saving?: boolean;
}) {
  const baseConfig = (section.draftConfig ?? section.config ?? {}) as HomepageSectionConfig;
  const [title, setTitle] = useState(section.title);
  const [isVisible, setIsVisible] = useState(section.isVisible);
  const [config, setConfig] = useState<HomepageSectionConfig>(baseConfig);

  useEffect(() => {
    setTitle(section.title);
    setIsVisible(section.isVisible);
    setConfig((section.draftConfig ?? section.config ?? {}) as HomepageSectionConfig);
  }, [section]);

  const updateButton = (index: number, field: keyof ButtonItem, value: string) => {
    const buttons = [...(config.buttons ?? [])];
    buttons[index] = { ...buttons[index], [field]: value };
    setConfig((c) => ({ ...c, buttons }));
  };

  const addButton = () => {
    setConfig((c) => ({
      ...c,
      buttons: [...(c.buttons ?? []), { label: "Learn More", href: "/", variant: "primary" }],
    }));
  };

  const removeButton = (index: number) => {
    setConfig((c) => ({
      ...c,
      buttons: (c.buttons ?? []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 820 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-hd">
          <h3>
            Edit: {section.title} <ContentStatusBadge status={section.status} />
          </h3>
          <button type="button" className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-bd" style={{ maxHeight: "75vh", overflowY: "auto" }}>
          <FormGrid>
            <FormItem label="Section Title" full>
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
            </FormItem>
            <FormItem label="Headline (HTML allowed)" full>
              <input
                value={config.headline ?? ""}
                onChange={(e) => setConfig((c) => ({ ...c, headline: e.target.value }))}
                placeholder='Your Trusted Partner in <span>Medical Excellence</span> & Health'
              />
            </FormItem>
            <FormItem label="Subtitle">
              <input
                value={config.subtitle ?? ""}
                onChange={(e) => setConfig((c) => ({ ...c, subtitle: e.target.value }))}
              />
            </FormItem>
            <FormItem label="Icon / Emoji">
              <input
                value={config.icon ?? ""}
                onChange={(e) => setConfig((c) => ({ ...c, icon: e.target.value }))}
                placeholder="🏥"
              />
            </FormItem>
            <FormItem label="Description" full>
              <textarea
                rows={3}
                value={config.description ?? ""}
                onChange={(e) => setConfig((c) => ({ ...c, description: e.target.value }))}
              />
            </FormItem>
            <FormItem label="Background Image URL" full>
              <input
                value={config.backgroundImage ?? ""}
                onChange={(e) => setConfig((c) => ({ ...c, backgroundImage: e.target.value }))}
              />
            </FormItem>
            <FormItem label="Featured Image URL" full>
              <input
                value={config.imageUrl ?? ""}
                onChange={(e) => setConfig((c) => ({ ...c, imageUrl: e.target.value }))}
              />
            </FormItem>
            <FormItem label="Call-to-Action Text" full>
              <input
                value={config.ctaText ?? ""}
                onChange={(e) => setConfig((c) => ({ ...c, ctaText: e.target.value }))}
              />
            </FormItem>
            <FormItem label="Accent Color">
              <input
                value={config.accentColor ?? ""}
                onChange={(e) => setConfig((c) => ({ ...c, accentColor: e.target.value }))}
                placeholder="#2563eb"
              />
            </FormItem>
            <FormItem label="Visible on Homepage">
              <label className="switch" style={{ marginTop: 8 }}>
                <input type="checkbox" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} />
                <span className="slider" />
              </label>
            </FormItem>
          </FormGrid>

          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <strong>Buttons</strong>
              <AdminButton onClick={addButton}>+ Add Button</AdminButton>
            </div>
            {(config.buttons ?? []).map((btn, i) => (
              <div key={i} className="form-grid" style={{ marginBottom: 10, padding: 12, background: "var(--gray-50)", borderRadius: 8 }}>
                <FormItem label="Label">
                  <input value={btn.label} onChange={(e) => updateButton(i, "label", e.target.value)} />
                </FormItem>
                <FormItem label="Link">
                  <input value={btn.href} onChange={(e) => updateButton(i, "href", e.target.value)} />
                </FormItem>
                <FormItem label="Variant">
                  <select value={btn.variant ?? "primary"} onChange={(e) => updateButton(i, "variant", e.target.value)}>
                    <option value="primary">Primary</option>
                    <option value="outline">Outline</option>
                    <option value="white">White</option>
                  </select>
                </FormItem>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <AdminButton variant="danger" onClick={() => removeButton(i)}>
                    Remove
                  </AdminButton>
                </div>
              </div>
            ))}
          </div>

          <div className="panel" style={{ marginTop: 16, padding: 12 }}>
            <strong>Live Preview</strong>
            <div style={{ marginTop: 8, padding: 16, borderRadius: 8, background: config.backgroundImage ? `url(${config.backgroundImage}) center/cover` : "var(--gray-100)" }}>
              {config.icon ? <div style={{ fontSize: "1.5rem" }}>{config.icon}</div> : null}
              <h4 style={{ margin: "8px 0 4px" }}>{title}</h4>
              {config.subtitle ? <p style={{ opacity: 0.8, margin: 0 }}>{config.subtitle}</p> : null}
              {config.description ? <p style={{ marginTop: 8 }}>{config.description}</p> : null}
              {config.ctaText ? <p style={{ marginTop: 8, fontWeight: 600 }}>{config.ctaText}</p> : null}
              <div className="btn-row" style={{ marginTop: 12 }}>
                {(config.buttons ?? []).map((b) => (
                  <span key={b.label} className="btn primary" style={{ pointerEvents: "none" }}>
                    {b.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="modal-ft">
          <AdminButton onClick={onRevert}>Revert Changes</AdminButton>
          <AdminButton onClick={() => onSaveDraft({ title, isVisible, draftConfig: config })}>
            Save Draft
          </AdminButton>
          <AdminButton variant="primary" onClick={onPublish}>
            Publish
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
