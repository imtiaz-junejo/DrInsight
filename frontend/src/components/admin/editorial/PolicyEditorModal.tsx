"use client";

import { useState } from "react";
import { AdminButton, FormGrid, FormItem } from "@/components/admin/ui/AdminPrimitives";
import { AdminRichTextEditor } from "@/components/admin/ui/AdminRichTextEditor";
import { VersionTimeline } from "@/components/admin/editorial/VersionTimeline";
import {
  POLICY_CATEGORY_LABELS,
  type EditorialPolicy,
  type EditorialPolicyCategory,
} from "@/services/editorial-api-hooks";

export function PolicyEditorModal({
  policy,
  onClose,
  onSave,
  saving,
}: {
  policy?: EditorialPolicy | null;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
  saving?: boolean;
}) {
  const [form, setForm] = useState({
    title: policy?.title ?? "",
    category: (policy?.category ?? "EDITORIAL_POLICY") as EditorialPolicyCategory,
    contentHtml: policy?.contentHtml ?? "",
    seoTitle: policy?.seoTitle ?? "",
    seoDescription: policy?.seoDescription ?? "",
    effectiveDate: policy?.effectiveDate?.slice(0, 10) ?? "",
    changeLog: "",
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 900 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-hd">
          <h3>{policy ? "Edit Policy" : "New Editorial Policy"}</h3>
          <button type="button" className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-bd" style={{ maxHeight: "75vh", overflowY: "auto" }}>
          <FormGrid>
            <FormItem label="Title" full>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </FormItem>
            <FormItem label="Category">
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as EditorialPolicyCategory }))}
              >
                {Object.entries(POLICY_CATEGORY_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </FormItem>
            <FormItem label="Effective Date">
              <input
                type="date"
                value={form.effectiveDate}
                onChange={(e) => setForm((f) => ({ ...f, effectiveDate: e.target.value }))}
              />
            </FormItem>
            <FormItem label="Content" full>
              <AdminRichTextEditor
                value={form.contentHtml}
                onChange={(contentHtml) => setForm((f) => ({ ...f, contentHtml }))}
              />
            </FormItem>
            <FormItem label="SEO Title" full>
              <input value={form.seoTitle} onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))} />
            </FormItem>
            <FormItem label="SEO Description" full>
              <textarea
                rows={2}
                value={form.seoDescription}
                onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
              />
            </FormItem>
            {policy ? (
              <FormItem label="Change Log" full>
                <textarea
                  rows={2}
                  value={form.changeLog}
                  onChange={(e) => setForm((f) => ({ ...f, changeLog: e.target.value }))}
                  placeholder="Describe what changed in this version..."
                />
              </FormItem>
            ) : null}
          </FormGrid>
          {policy?.versions?.length ? (
            <div style={{ marginTop: 24 }}>
              <h4 style={{ marginBottom: 12 }}>Version History</h4>
              <VersionTimeline versions={policy.versions} />
            </div>
          ) : null}
        </div>
        <div className="modal-ft">
          <AdminButton onClick={onClose}>Cancel</AdminButton>
          <AdminButton variant="primary" onClick={() => onSave(form)}>
            {saving ? "Saving..." : policy ? "Save New Version" : "Create Policy"}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
