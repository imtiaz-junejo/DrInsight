"use client";

import { useEffect, useState } from "react";
import { AdminButton, FormGrid, FormItem } from "@/components/admin/ui/AdminPrimitives";
import { AdminRichTextEditor } from "@/components/admin/ui/AdminRichTextEditor";
import type { FaqItem, FaqStatus } from "@/services/cms-api-hooks";

const FAQ_STATUSES: FaqStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export function FaqEditorModal({
  faq,
  onClose,
  onSave,
  saving,
}: {
  faq?: FaqItem | null;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
  saving?: boolean;
}) {
  const [form, setForm] = useState({
    question: faq?.question ?? "",
    answer: faq?.answer ?? "",
    category: faq?.category ?? "General",
    displayOrder: faq?.displayOrder ?? 0,
    priority: faq?.priority ?? 0,
    status: (faq?.status ?? "PUBLISHED") as FaqStatus,
    isActive: faq?.isActive ?? true,
    relatedSpecialty: faq?.relatedSpecialty ?? "",
    relatedService: faq?.relatedService ?? "",
    tags: (faq?.tags ?? []).join(", "),
  });

  useEffect(() => {
    if (!faq) return;
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      displayOrder: faq.displayOrder,
      priority: faq.priority ?? 0,
      status: (faq.status ?? "PUBLISHED") as FaqStatus,
      isActive: faq.isActive,
      relatedSpecialty: faq.relatedSpecialty ?? "",
      relatedService: faq.relatedService ?? "",
      tags: (faq.tags ?? []).join(", "),
    });
  }, [faq]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 860 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-hd">
          <h3>{faq ? "Edit FAQ" : "Add FAQ"}</h3>
          <button type="button" className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-bd" style={{ maxHeight: "75vh", overflowY: "auto" }}>
          <FormGrid>
            <FormItem label="Question" full>
              <input value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} />
            </FormItem>
            <FormItem label="Category">
              <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
            </FormItem>
            <FormItem label="Status">
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as FaqStatus }))}>
                {FAQ_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </FormItem>
            <FormItem label="Display Order">
              <input
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm((f) => ({ ...f, displayOrder: Number(e.target.value) }))}
              />
            </FormItem>
            <FormItem label="Priority">
              <input
                type="number"
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: Number(e.target.value) }))}
              />
            </FormItem>
            <FormItem label="Related Specialty">
              <input value={form.relatedSpecialty} onChange={(e) => setForm((f) => ({ ...f, relatedSpecialty: e.target.value }))} />
            </FormItem>
            <FormItem label="Related Service">
              <input value={form.relatedService} onChange={(e) => setForm((f) => ({ ...f, relatedService: e.target.value }))} />
            </FormItem>
            <FormItem label="Tags (comma-separated)" full>
              <input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />
            </FormItem>
            <FormItem label="Answer" full>
              <AdminRichTextEditor value={form.answer} onChange={(answer) => setForm((f) => ({ ...f, answer }))} />
            </FormItem>
            <FormItem label="Visible">
              <label className="switch" style={{ marginTop: 8 }}>
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
                <span className="slider" />
              </label>
            </FormItem>
          </FormGrid>
        </div>
        <div className="modal-ft">
          <AdminButton onClick={onClose}>Cancel</AdminButton>
          <AdminButton
            variant="primary"
            onClick={() =>
              onSave({
                ...form,
                tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
              })
            }
          >
            Save FAQ
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
