"use client";

import { useMemo, useState } from "react";
import {
  AdminButton,
  AdminPagination,
  AdminPanel,
  FilterPills,
  FormGrid,
  FormItem,
  StatusChip,
  TemplateItem,
  ToggleSwitch,
} from "@/components/admin/ui/AdminPrimitives";
import { AdminRichTextEditor } from "@/components/admin/ui/AdminRichTextEditor";
import { EMAIL_CATEGORIES, EMAIL_TEMPLATE_VARIABLES } from "@/lib/communication-constants";
import { formatRelativeTime } from "@/lib/admin-utils";
import { useAdminUiStore } from "@/store/admin-ui.store";
import {
  type EmailTemplate,
  useAdminEmailTemplates,
  useCreateEmailTemplate,
  useDeleteEmailTemplate,
  useDuplicateEmailTemplate,
  usePreviewEmailTemplate,
  useUpdateEmailTemplate,
  useUpdateEmailTemplateStatus,
} from "@/services/communication-api-hooks";

type EmailForm = {
  name: string;
  subject: string;
  category: string;
  bodyHtml: string;
  status: "ACTIVE" | "DRAFT";
  isEnabled: boolean;
  icon: string;
};

const EMPTY_FORM: EmailForm = {
  name: "",
  subject: "",
  category: "General",
  bodyHtml: "<p>Hi {{patientName}},</p>",
  status: "DRAFT",
  isEnabled: true,
  icon: "✉️",
};

function creatorName(template: EmailTemplate) {
  if (!template.createdBy) return "System";
  return `${template.createdBy.firstName} ${template.createdBy.lastName}`;
}

export function EmailTemplatesPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState({ subject: "", bodyHtml: "" });
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [form, setForm] = useState<EmailForm>(EMPTY_FORM);

  const templatesQuery = useAdminEmailTemplates({
    page,
    limit: 20,
    search: search.trim() || undefined,
    status: statusFilter,
  });
  const createMutation = useCreateEmailTemplate();
  const updateMutation = useUpdateEmailTemplate();
  const deleteMutation = useDeleteEmailTemplate();
  const duplicateMutation = useDuplicateEmailTemplate();
  const statusMutation = useUpdateEmailTemplateStatus();
  const previewMutation = usePreviewEmailTemplate();

  const templates = templatesQuery.data?.data ?? [];
  const meta = templatesQuery.data?.meta;

  const statusFilters = useMemo(() => ["All", "Active", "Draft"], []);
  const statusIndex = statusFilter === "all" ? 0 : statusFilter === "active" ? 1 : 2;

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (template: EmailTemplate) => {
    setEditing(template);
    setForm({
      name: template.name,
      subject: template.subject,
      category: template.category,
      bodyHtml: template.bodyHtml,
      status: template.status,
      isEnabled: template.isEnabled,
      icon: template.icon ?? "✉️",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.subject.trim() || !form.bodyHtml.trim()) {
      showToast("Please complete all required fields");
      return;
    }

    const payload = {
      name: form.name.trim(),
      subject: form.subject.trim(),
      category: form.category,
      bodyHtml: form.bodyHtml,
      status: form.status,
      isEnabled: form.isEnabled,
      icon: form.icon,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, ...payload });
        showToast("Template updated ✓");
      } else {
        await createMutation.mutateAsync(payload);
        showToast("Template created ✓");
      }
      closeModal();
    } catch {
      showToast("Failed to save template");
    }
  };

  const handlePreview = async () => {
    try {
      const result = await previewMutation.mutateAsync({
        subject: form.subject,
        bodyHtml: form.bodyHtml,
      });
      setPreviewHtml(result);
      setPreviewOpen(true);
    } catch {
      showToast("Preview failed");
    }
  };

  const insertVariable = (variable: string) => {
    setForm((prev) => ({ ...prev, bodyHtml: `${prev.bodyHtml}${variable}` }));
  };

  return (
    <>
      <AdminPanel
        title="✉️ Automated Email Templates"
        actions={<AdminButton variant="primary" onClick={openCreate}>+ New Template</AdminButton>}
        bodyClassName="panel-bd"
      >
        <div className="flt-row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <FilterPills
            filters={statusFilters}
            activeIndex={statusIndex}
            onChange={(index) => setStatusFilter(index === 0 ? "all" : index === 1 ? "active" : "draft")}
          />
          <div className="panel-search">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search templates..."
            />
          </div>
        </div>

        {templatesQuery.isLoading ? (
          <div className="empty-state">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="empty-state">No email templates found</div>
        ) : (
          templates.map((template) => (
            <TemplateItem
              key={template.id}
              icon={template.icon ?? "✉️"}
              title={template.name}
              subtitle={`${template.category} · ${template.status === "ACTIVE" ? "Active" : "Draft"} · Last edited ${formatRelativeTime(template.updatedAt)} · By ${creatorName(template)}`}
              actions={
                <>
                  <AdminButton onClick={() => openEdit(template)}>Edit</AdminButton>
                  <AdminButton onClick={() => duplicateMutation.mutateAsync(template.id).then(() => showToast("Template duplicated ✓"))}>
                    Duplicate
                  </AdminButton>
                  <AdminButton
                    onClick={async () => {
                      const result = await previewMutation.mutateAsync({
                        subject: template.subject,
                        bodyHtml: template.bodyHtml,
                      });
                      setPreviewHtml(result);
                      setPreviewOpen(true);
                    }}
                  >
                    Preview
                  </AdminButton>
                  <AdminButton
                    variant="danger"
                    onClick={async () => {
                      try {
                        await deleteMutation.mutateAsync(template.id);
                        showToast("Template deleted");
                      } catch {
                        showToast("Failed to delete template");
                      }
                    }}
                  >
                    Delete
                  </AdminButton>
                  <StatusChip
                    label={template.status === "ACTIVE" ? "Active" : "Draft"}
                    className={template.status === "ACTIVE" ? "ch-g" : "ch-a"}
                  />
                  <ToggleSwitch
                    defaultChecked={template.isEnabled}
                    onChange={async (checked) => {
                      try {
                        await statusMutation.mutateAsync({ id: template.id, isEnabled: checked });
                        showToast(checked ? "Template enabled" : "Template disabled");
                      } catch {
                        showToast("Failed to update status");
                      }
                    }}
                  />
                </>
              }
            />
          ))
        )}

        {meta && meta.totalPages > 1 ? (
          <AdminPagination
            info={`Showing ${templates.length} of ${meta.total} templates`}
            page={meta.page}
            totalPages={meta.totalPages}
            onPageChange={setPage}
          />
        ) : null}
      </AdminPanel>

      {modalOpen ? (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-hd">
              <h3>{editing ? "Edit Email Template" : "New Email Template"}</h3>
              <button type="button" className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-bd">
              <FormGrid>
                <FormItem label="Template Name" full>
                  <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                </FormItem>
                <FormItem label="Subject">
                  <input value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} />
                </FormItem>
                <FormItem label="Category">
                  <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                    {EMAIL_CATEGORIES.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </FormItem>
                <FormItem label="Status">
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as EmailForm["status"] }))}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </FormItem>
                <FormItem label="Icon">
                  <input value={form.icon} onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))} />
                </FormItem>
                <FormItem label="Enabled">
                  <label className="switch" style={{ marginTop: 8 }}>
                    <input
                      type="checkbox"
                      checked={form.isEnabled}
                      onChange={(e) => setForm((p) => ({ ...p, isEnabled: e.target.checked }))}
                    />
                    <span className="slider" />
                  </label>
                </FormItem>
                <FormItem label="Available Variables" full>
                  <div className="btn-row">
                    {EMAIL_TEMPLATE_VARIABLES.map((variable) => (
                      <button key={variable} type="button" className="btn" onClick={() => insertVariable(variable)}>
                        {variable}
                      </button>
                    ))}
                  </div>
                </FormItem>
                <FormItem label="Email Body (HTML)" full>
                  <AdminRichTextEditor value={form.bodyHtml} onChange={(bodyHtml) => setForm((p) => ({ ...p, bodyHtml }))} />
                </FormItem>
              </FormGrid>
            </div>
            <div className="modal-ft">
              <AdminButton onClick={handlePreview}>Preview</AdminButton>
              <AdminButton onClick={closeModal}>Cancel</AdminButton>
              <AdminButton variant="primary" onClick={handleSave}>
                {editing ? "Save Changes" : "Create Template"}
              </AdminButton>
            </div>
          </div>
        </div>
      ) : null}

      {previewOpen ? (
        <div className="modal-overlay" onClick={() => setPreviewOpen(false)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-hd">
              <h3>Email Preview</h3>
              <button type="button" className="modal-close" onClick={() => setPreviewOpen(false)}>✕</button>
            </div>
            <div className="modal-bd">
              <p className="live-preview-note">Live preview with sample variable values</p>
              <div className="fg-item">
                <label>Subject</label>
                <div className="kv-card" style={{ textAlign: "left" }}>{previewHtml.subject}</div>
              </div>
              <div className="fg-item">
                <label>Body</label>
                <div className="rte-editor" dangerouslySetInnerHTML={{ __html: previewHtml.bodyHtml }} />
              </div>
            </div>
            <div className="modal-ft">
              <AdminButton variant="primary" onClick={() => setPreviewOpen(false)}>Close</AdminButton>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
