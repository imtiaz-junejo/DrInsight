"use client";

import { useState } from "react";
import { AdminButton, FormGrid, FormItem } from "@/components/admin/ui/AdminPrimitives";
import { AdminRichTextEditor } from "@/components/admin/ui/AdminRichTextEditor";
import { VersionTimeline } from "@/components/admin/editorial/VersionTimeline";
import {
  GUIDELINE_CATEGORY_LABELS,
  type AuthorGuideline,
  type AuthorGuidelineCategory,
} from "@/services/editorial-api-hooks";

export function GuidelineEditorModal({
  guideline,
  onClose,
  onSave,
  onAddAttachment,
  saving,
}: {
  guideline?: AuthorGuideline | null;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
  onAddAttachment?: (file: { fileName: string; fileUrl: string }) => void;
  saving?: boolean;
}) {
  const [form, setForm] = useState({
    title: guideline?.title ?? "",
    category: (guideline?.category ?? "SUBMISSION_GUIDELINES") as AuthorGuidelineCategory,
    contentHtml: guideline?.contentHtml ?? "",
    seoTitle: guideline?.seoTitle ?? "",
    seoDescription: guideline?.seoDescription ?? "",
    changeLog: "",
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 900 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-hd">
          <h3>{guideline ? "Edit Guideline" : "New Author Guideline"}</h3>
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
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as AuthorGuidelineCategory }))}
              >
                {Object.entries(GUIDELINE_CATEGORY_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
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
            {guideline ? (
              <FormItem label="Change Log" full>
                <textarea
                  rows={2}
                  value={form.changeLog}
                  onChange={(e) => setForm((f) => ({ ...f, changeLog: e.target.value }))}
                />
              </FormItem>
            ) : null}
          </FormGrid>
          {guideline?.attachments?.length ? (
            <div style={{ marginTop: 16 }}>
              <h4>Attachments</h4>
              <ul>
                {guideline.attachments.map((a) => (
                  <li key={a.id}>
                    <a href={a.fileUrl} target="_blank" rel="noopener noreferrer">
                      {a.fileName}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {onAddAttachment ? (
            <div style={{ marginTop: 12 }}>
              <AdminButton
                onClick={() => {
                  const url = window.prompt("Attachment URL (PDF or image)");
                  const name = window.prompt("File name");
                  if (url && name) onAddAttachment({ fileName: name, fileUrl: url });
                }}
              >
                + Add Attachment
              </AdminButton>
            </div>
          ) : null}
          {guideline?.versions?.length ? (
            <div style={{ marginTop: 24 }}>
              <h4 style={{ marginBottom: 12 }}>Version History</h4>
              <VersionTimeline versions={guideline.versions} />
            </div>
          ) : null}
        </div>
        <div className="modal-ft">
          <AdminButton onClick={onClose}>Cancel</AdminButton>
          <AdminButton variant="primary" onClick={() => onSave(form)}>
            {saving ? "Saving..." : guideline ? "Save New Version" : "Create Guideline"}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
