"use client";

import { useMemo, useState } from "react";
import {
  AdminButton,
  AdminPagination,
  AdminPanel,
  FilterPills,
  FormGrid,
  FormItem,
  KvGrid,
  StatusChip,
  TemplateItem,
  ToggleSwitch,
} from "@/components/admin/ui/AdminPrimitives";
import { OTP_PURPOSES, OTP_TEMPLATE_VARIABLES, purposeLabel } from "@/lib/communication-constants";
import { formatNumber, formatRelativeTime } from "@/lib/admin-utils";
import { useAdminUiStore } from "@/store/admin-ui.store";
import {
  type OtpTemplate,
  useAdminOtpTemplates,
  useCreateOtpTemplate,
  useDeleteOtpTemplate,
  useOtpTemplateStats,
  usePreviewOtpTemplate,
  useTestSendOtpTemplate,
  useUpdateOtpTemplate,
  useUpdateOtpTemplateStatus,
} from "@/services/communication-api-hooks";

type OtpForm = {
  name: string;
  purpose: string;
  subject: string;
  message: string;
  expiryMinutes: string;
  otpLength: string;
  senderName: string;
  status: "ACTIVE" | "DRAFT";
  isEnabled: boolean;
};

const EMPTY_FORM: OtpForm = {
  name: "",
  purpose: "LOGIN",
  subject: "Your DrInsight verification code",
  message: "Your DrInsight verification code is {{otp}}. It expires in {{expiry}}.",
  expiryMinutes: "10",
  otpLength: "6",
  senderName: "DrInsight",
  status: "DRAFT",
  isEnabled: true,
};

export function OtpTemplatesPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMessage, setPreviewMessage] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [editing, setEditing] = useState<OtpTemplate | null>(null);
  const [form, setForm] = useState<OtpForm>(EMPTY_FORM);

  const templatesQuery = useAdminOtpTemplates({
    page,
    limit: 20,
    search: search.trim() || undefined,
    status: statusFilter,
  });
  const statsQuery = useOtpTemplateStats();
  const createMutation = useCreateOtpTemplate();
  const updateMutation = useUpdateOtpTemplate();
  const deleteMutation = useDeleteOtpTemplate();
  const statusMutation = useUpdateOtpTemplateStatus();
  const previewMutation = usePreviewOtpTemplate();
  const testSendMutation = useTestSendOtpTemplate();

  const templates = templatesQuery.data?.data ?? [];
  const meta = templatesQuery.data?.meta;
  const stats = statsQuery.data;

  const statusFilters = useMemo(() => ["All", "Active", "Draft"], []);
  const statusIndex = statusFilter === "all" ? 0 : statusFilter === "active" ? 1 : 2;

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (template: OtpTemplate) => {
    setEditing(template);
    setForm({
      name: template.name,
      purpose: template.purpose,
      subject: template.subject ?? "",
      message: template.message,
      expiryMinutes: String(template.expiryMinutes),
      otpLength: String(template.otpLength),
      senderName: template.senderName,
      status: template.status,
      isEnabled: template.isEnabled,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setTestEmail("");
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.message.trim()) {
      showToast("Please complete all required fields");
      return;
    }

    const payload = {
      name: form.name.trim(),
      purpose: form.purpose,
      subject: form.subject.trim() || undefined,
      message: form.message.trim(),
      expiryMinutes: Number(form.expiryMinutes),
      otpLength: Number(form.otpLength),
      senderName: form.senderName.trim() || "DrInsight",
      status: form.status,
      isEnabled: form.isEnabled,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, ...payload });
        showToast("OTP template updated ✓");
      } else {
        await createMutation.mutateAsync(payload);
        showToast("OTP template created ✓");
      }
      closeModal();
    } catch {
      showToast("Failed to save OTP template");
    }
  };

  const handlePreview = async () => {
    if (!editing) {
      setPreviewMessage(form.message);
      setPreviewOpen(true);
      return;
    }
    try {
      const result = await previewMutation.mutateAsync({ id: editing.id, message: form.message });
      setPreviewMessage(result.message);
      setPreviewOpen(true);
    } catch {
      showToast("Preview failed");
    }
  };

  const handleTestSend = async () => {
    if (!editing || !testEmail.trim()) {
      showToast("Enter a test email address");
      return;
    }
    try {
      await testSendMutation.mutateAsync({ id: editing.id, email: testEmail.trim() });
      showToast("Test OTP sent ✓");
    } catch {
      showToast("Test send failed");
    }
  };

  return (
    <>
      <AdminPanel
        title="🔢 OTP Templates"
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
              placeholder="Search OTP templates..."
            />
          </div>
        </div>

        {templatesQuery.isLoading ? (
          <div className="empty-state">Loading OTP templates...</div>
        ) : templates.length === 0 ? (
          <div className="empty-state">No OTP templates found</div>
        ) : (
          templates.map((template) => (
            <TemplateItem
              key={template.id}
              icon="🔢"
              title={template.name}
              subtitle={`${purposeLabel(template.purpose)} · ${template.otpLength} digits · ${template.expiryMinutes} min expiry · Last edited ${formatRelativeTime(template.updatedAt)}`}
              actions={
                <>
                  <AdminButton onClick={() => openEdit(template)}>Edit</AdminButton>
                  <AdminButton
                    onClick={async () => {
                      const result = await previewMutation.mutateAsync({ id: template.id, message: template.message });
                      setPreviewMessage(result.message);
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
                        showToast("OTP template deleted");
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
                        showToast(checked ? "Template activated" : "Template deactivated");
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

      <AdminPanel title="📊 OTP Delivery Stats (Last 24h)" bodyClassName="panel-bd">
        <KvGrid
          items={[
            { value: formatNumber(stats?.emailSent ?? 0), label: "OTPs Sent (Email)" },
            { value: formatNumber(stats?.smsSent ?? 0), label: "OTPs Sent (SMS)" },
            {
              value: stats?.successRate ? `${stats.successRate}%` : "—",
              label: "Successful Verification Rate",
            },
          ]}
        />
      </AdminPanel>

      {modalOpen ? (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: 680 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-hd">
              <h3>{editing ? "Edit OTP Template" : "New OTP Template"}</h3>
              <button type="button" className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-bd">
              <FormGrid>
                <FormItem label="Template Name" full>
                  <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                </FormItem>
                <FormItem label="Purpose">
                  <select value={form.purpose} onChange={(e) => setForm((p) => ({ ...p, purpose: e.target.value }))}>
                    {OTP_PURPOSES.map((purpose) => (
                      <option key={purpose.value} value={purpose.value}>{purpose.label}</option>
                    ))}
                  </select>
                </FormItem>
                <FormItem label="Sender Name">
                  <input value={form.senderName} onChange={(e) => setForm((p) => ({ ...p, senderName: e.target.value }))} />
                </FormItem>
                <FormItem label="Subject">
                  <input value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} />
                </FormItem>
                <FormItem label="OTP Length">
                  <select value={form.otpLength} onChange={(e) => setForm((p) => ({ ...p, otpLength: e.target.value }))}>
                    <option value="4">4 digits</option>
                    <option value="6">6 digits</option>
                    <option value="8">8 digits</option>
                  </select>
                </FormItem>
                <FormItem label="Expiry (minutes)">
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={form.expiryMinutes}
                    onChange={(e) => setForm((p) => ({ ...p, expiryMinutes: e.target.value }))}
                  />
                </FormItem>
                <FormItem label="Status">
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as OtpForm["status"] }))}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="DRAFT">Draft</option>
                  </select>
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
                    {OTP_TEMPLATE_VARIABLES.map((variable) => (
                      <button
                        key={variable}
                        type="button"
                        className="btn"
                        onClick={() => setForm((p) => ({ ...p, message: `${p.message}${variable}` }))}
                      >
                        {variable}
                      </button>
                    ))}
                  </div>
                </FormItem>
                <FormItem label="Message Template" full>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    rows={5}
                  />
                </FormItem>
                {editing ? (
                  <FormItem label="Test Send Email" full>
                    <div className="btn-row">
                      <input
                        style={{ flex: 1 }}
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="test@example.com"
                      />
                      <AdminButton variant="primary" onClick={handleTestSend}>Test Send</AdminButton>
                    </div>
                  </FormItem>
                ) : null}
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hd">
              <h3>OTP Preview</h3>
              <button type="button" className="modal-close" onClick={() => setPreviewOpen(false)}>✕</button>
            </div>
            <div className="modal-bd">
              <p className="live-preview-note">Preview with sample variable values</p>
              <div className="kv-card" style={{ textAlign: "left" }}>{previewMessage}</div>
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
