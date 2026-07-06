"use client";

import { useMemo, useState } from "react";
import {
  AdminButton,
  AdminPanel,
  AdminPagination,
  FormGrid,
  FormItem,
  StatusChip,
  ToggleSwitch,
} from "@/components/admin/ui/AdminPrimitives";
import { uploadFile } from "@/lib/upload";
import { useAdminUiStore } from "@/store/admin-ui.store";
import {
  type TrustedPartner,
  useAdminTrustedPartners,
  useCreateTrustedPartner,
  useDeleteTrustedPartner,
  useReorderTrustedPartners,
  useUpdateTrustedPartner,
  useUpdateTrustedPartnerStatus,
} from "@/services/admin-api-hooks";

type PartnerForm = {
  companyName: string;
  description: string;
  websiteUrl: string;
  logoUrl: string;
  displayOrder: string;
  isActive: boolean;
};

const EMPTY_FORM: PartnerForm = {
  companyName: "",
  description: "",
  websiteUrl: "",
  logoUrl: "",
  displayOrder: "",
  isActive: true,
};

function PartnerThumb({ partner }: { partner: Pick<TrustedPartner, "logoUrl" | "companyName"> }) {
  if (partner.logoUrl) {
    return (
      <div className="pac-img">
        <img src={partner.logoUrl} alt={partner.companyName} />
      </div>
    );
  }
  return <div className="pac-img">🤝</div>;
}

export function TrustedPartnersPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TrustedPartner | null>(null);
  const [form, setForm] = useState<PartnerForm>(EMPTY_FORM);
  const [logoPreview, setLogoPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  const partnersQuery = useAdminTrustedPartners({
    page,
    limit: 12,
    search: search.trim() || undefined,
    status: statusFilter,
  });
  const createMutation = useCreateTrustedPartner();
  const updateMutation = useUpdateTrustedPartner();
  const deleteMutation = useDeleteTrustedPartner();
  const reorderMutation = useReorderTrustedPartners();
  const statusMutation = useUpdateTrustedPartnerStatus();

  const partners = partnersQuery.data?.data ?? [];
  const meta = partnersQuery.data?.meta;

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setLogoPreview("");
    setModalOpen(true);
  };

  const openEdit = (partner: TrustedPartner) => {
    setEditing(partner);
    setForm({
      companyName: partner.companyName,
      description: partner.description ?? "",
      websiteUrl: partner.websiteUrl ?? "",
      logoUrl: partner.logoUrl ?? "",
      displayOrder: String(partner.displayOrder),
      isActive: partner.isActive,
    });
    setLogoPreview(partner.logoUrl ?? "");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setLogoPreview("");
  };

  const handleLogoUpload = async (file: File | undefined) => {
    if (!file) return;
    try {
      setUploading(true);
      const url = await uploadFile(file, "drinsight/partners");
      setLogoPreview(url);
      setForm((prev) => ({ ...prev, logoUrl: url }));
      showToast("Logo uploaded");
    } catch {
      showToast("Logo upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.companyName.trim()) {
      showToast("Please enter a company name");
      return;
    }

    const payload = {
      companyName: form.companyName.trim(),
      description: form.description.trim() || undefined,
      websiteUrl: form.websiteUrl.trim() || undefined,
      logoUrl: form.logoUrl || undefined,
      displayOrder: form.displayOrder ? Number(form.displayOrder) : undefined,
      isActive: form.isActive,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, ...payload });
        showToast("Partner updated ✓");
      } else {
        await createMutation.mutateAsync(payload);
        showToast("Partner added ✓");
      }
      closeModal();
    } catch {
      showToast("Failed to save partner");
    }
  };

  const handleDelete = async (partner: TrustedPartner) => {
    if (!window.confirm(`Delete partner “${partner.companyName}”? This will remove it from the About page.`)) return;
    try {
      await deleteMutation.mutateAsync(partner.id);
      showToast("Partner deleted");
    } catch {
      showToast("Failed to delete partner");
    }
  };

  const movePartner = async (partner: TrustedPartner, direction: -1 | 1) => {
    const index = partners.findIndex((p) => p.id === partner.id);
    const swapIndex = index + direction;
    if (index < 0 || swapIndex < 0 || swapIndex >= partners.length) return;

    const current = partners[index];
    const swap = partners[swapIndex];
    try {
      await reorderMutation.mutateAsync([
        { id: current.id, displayOrder: swap.displayOrder },
        { id: swap.id, displayOrder: current.displayOrder },
      ]);
      showToast("Order updated");
    } catch {
      showToast("Failed to reorder partners");
    }
  };

  const pagerInfo = useMemo(() => {
    if (!meta) return "Loading partners...";
    const start = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
    const end = Math.min(meta.page * meta.limit, meta.total);
    return `Showing ${start}–${end} of ${meta.total} partners`;
  }, [meta]);

  return (
    <>
      <AdminPanel
        title="🤝 Trusted Partners & Affiliates"
        actions={
          <>
            <AdminButton onClick={() => window.open("/about", "_blank")}>👁 Preview Live Section</AdminButton>
            <AdminButton variant="primary" onClick={openCreate}>
              + Add Partner
            </AdminButton>
          </>
        }
        bodyClassName="panel-bd"
      >
        <p style={{ fontSize: "0.82rem", color: "var(--gray-600)", marginBottom: 16 }}>
          These tiles appear in the scrolling “Trusted Partners &amp; Affiliates” strip on the public About page.
          There are currently <strong>{meta?.total ?? 0}</strong> partner{(meta?.total ?? 0) === 1 ? "" : "s"}.
        </p>

        <div className="btn-row" style={{ marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <input
            type="search"
            placeholder="Search partners..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ flex: 1, minWidth: 200 }}
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as "all" | "active" | "inactive");
              setPage(1);
            }}
          >
            <option value="all">All statuses</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>
        </div>

        {partnersQuery.isLoading ? (
          <p style={{ color: "var(--gray-500)" }}>Loading partners...</p>
        ) : partners.length === 0 ? (
          <div className="empty-state">No partners yet. Click “+ Add Partner” to create the first one.</div>
        ) : (
          <div className="partner-admin-grid">
            {partners.map((partner, index) => (
              <div key={partner.id} className="partner-admin-card">
                <div className="pac-top">
                  <PartnerThumb partner={partner} />
                  <div className="pac-meta">
                    <div className="pac-name">{partner.companyName}</div>
                    <div className="pac-tag">{partner.description || "No description"}</div>
                  </div>
                </div>
                {partner.websiteUrl ? (
                  <a className="pac-link" href={partner.websiteUrl} target="_blank" rel="noopener noreferrer">
                    🔗 {partner.websiteUrl.replace(/^https?:\/\//, "")}
                  </a>
                ) : (
                  <span className="pac-tag" style={{ color: "var(--gray-400)" }}>
                    No link set
                  </span>
                )}
                <div className="btn-row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <StatusChip label={partner.isActive ? "Active" : "Inactive"} className={partner.isActive ? "ch-g" : "ch-r"} />
                  <ToggleSwitch
                    defaultChecked={partner.isActive}
                    onChange={async (checked) => {
                      try {
                        await statusMutation.mutateAsync({ id: partner.id, isActive: checked });
                        showToast(checked ? "Partner activated" : "Partner deactivated");
                      } catch {
                        showToast("Failed to update status");
                      }
                    }}
                  />
                </div>
                <div className="pac-actions">
                  <AdminButton onClick={() => index > 0 && movePartner(partner, -1)}>↑</AdminButton>
                  <AdminButton onClick={() => index < partners.length - 1 && movePartner(partner, 1)}>↓</AdminButton>
                  <AdminButton onClick={() => openEdit(partner)}>✏️ Edit</AdminButton>
                  <AdminButton variant="danger" onClick={() => handleDelete(partner)}>
                    🗑 Delete
                  </AdminButton>
                </div>
              </div>
            ))}
          </div>
        )}

        {meta && meta.totalPages > 1 ? (
          <AdminPagination
            info={pagerInfo}
            page={meta.page}
            totalPages={meta.totalPages}
            onPageChange={setPage}
          />
        ) : null}
      </AdminPanel>

      {modalOpen ? (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hd">
              <h3>{editing ? "Edit Partner" : "Add New Partner"}</h3>
              <button type="button" className="modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>
            <div className="modal-bd">
              <FormGrid>
                <FormItem label="Company Name" full>
                  <input
                    value={form.companyName}
                    onChange={(e) => setForm((prev) => ({ ...prev, companyName: e.target.value }))}
                    placeholder="e.g. PharmaCare"
                  />
                </FormItem>
                <FormItem label="Description / Tagline" full>
                  <input
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g. Pharmaceutical Partner"
                  />
                </FormItem>
                <FormItem label="Logo / Image" full>
                  <div className="img-upload">
                    <div className="img-thumb" id="pf-thumb">
                      {logoPreview ? <img src={logoPreview} alt="" /> : "🤝"}
                    </div>
                    <div className="img-upload-actions">
                      <label className="upload-btn">
                        📁 Upload image
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploading}
                          onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                        />
                      </label>
                      <span className="upload-hint">PNG, JPG or SVG. Square images look best.</span>
                    </div>
                  </div>
                </FormItem>
                <FormItem label="Website URL" full>
                  <input
                    value={form.websiteUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, websiteUrl: e.target.value }))}
                    placeholder="https://partner-website.com"
                  />
                </FormItem>
                <FormItem label="Display Order">
                  <input
                    type="number"
                    min={0}
                    value={form.displayOrder}
                    onChange={(e) => setForm((prev) => ({ ...prev, displayOrder: e.target.value }))}
                    placeholder="Auto"
                  />
                </FormItem>
                <FormItem label="Status">
                  <label className="switch" style={{ marginTop: 8 }}>
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                    />
                    <span className="slider" />
                  </label>
                </FormItem>
              </FormGrid>
            </div>
            <div className="modal-ft">
              <AdminButton onClick={closeModal}>Cancel</AdminButton>
              <AdminButton variant="primary" onClick={handleSave}>
                {editing ? "Save Changes" : "Add Partner"}
              </AdminButton>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
