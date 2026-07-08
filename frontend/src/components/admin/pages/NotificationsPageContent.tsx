"use client";

import { useMemo, useState } from "react";
import {
  AdminButton,
  AdminPanel,
  FilterPills,
  FormGrid,
  FormItem,
  PanelTable,
  StatCardRow,
  StatusChip,
  UserCell,
} from "@/components/admin/ui/AdminPrimitives";
import {
  CAMPAIGN_STATUSES,
  NOTIFICATION_AUDIENCES,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_PRIORITIES,
  audienceLabel,
  formatChannels,
} from "@/lib/communication-constants";
import { formatNumber, formatRelativeTime } from "@/lib/admin-utils";
import { useAdminUiStore } from "@/store/admin-ui.store";
import { useAdminUsers } from "@/services/admin-api-hooks";
import {
  type NotificationCampaign,
  useAdminNotificationCampaigns,
  useBulkArchiveNotificationCampaigns,
  useBulkDeleteNotificationCampaigns,
  useBulkSendNotificationCampaigns,
  useCreateNotificationCampaign,
  useDeleteNotificationCampaign,
  useDuplicateNotificationCampaign,
  useNotificationCampaignStats,
  useSendNotificationCampaign,
  useUpdateNotificationCampaign,
} from "@/services/communication-api-hooks";

type CampaignForm = {
  title: string;
  message: string;
  type: string;
  priority: string;
  audience: string;
  audienceUserId: string;
  channels: string[];
  scheduleAt: string;
  expiresAt: string;
  actionLabel: string;
  actionUrl: string;
  status: string;
};

const EMPTY_FORM: CampaignForm = {
  title: "",
  message: "",
  type: "GENERAL",
  priority: "NORMAL",
  audience: "ALL_USERS",
  audienceUserId: "",
  channels: ["IN_APP"],
  scheduleAt: "",
  expiresAt: "",
  actionLabel: "",
  actionUrl: "",
  status: "DRAFT",
};

function statusChip(status: string) {
  const item = CAMPAIGN_STATUSES.find((entry) => entry.value === status);
  return <StatusChip label={item?.label ?? status} className={item?.chip ?? "ch-gray"} />;
}

function recipientLabel(campaign: NotificationCampaign) {
  if (campaign.audience === "INDIVIDUAL" && campaign.audienceUser) {
    return `${campaign.audienceUser.firstName} ${campaign.audienceUser.lastName}`;
  }
  return audienceLabel(campaign.audience);
}

export function NotificationsPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewCampaign, setPreviewCampaign] = useState<NotificationCampaign | null>(null);
  const [editing, setEditing] = useState<NotificationCampaign | null>(null);
  const [form, setForm] = useState<CampaignForm>(EMPTY_FORM);

  const campaignsQuery = useAdminNotificationCampaigns({
    page,
    limit: 20,
    search: search.trim() || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });
  const statsQuery = useNotificationCampaignStats();
  const usersQuery = useAdminUsers({ limit: 100 });
  const createMutation = useCreateNotificationCampaign();
  const updateMutation = useUpdateNotificationCampaign();
  const deleteMutation = useDeleteNotificationCampaign();
  const duplicateMutation = useDuplicateNotificationCampaign();
  const sendMutation = useSendNotificationCampaign();
  const bulkDeleteMutation = useBulkDeleteNotificationCampaigns();
  const bulkArchiveMutation = useBulkArchiveNotificationCampaigns();
  const bulkSendMutation = useBulkSendNotificationCampaigns();

  const campaigns = campaignsQuery.data?.data ?? [];
  const meta = campaignsQuery.data?.meta;
  const stats = statsQuery.data;
  const users = usersQuery.data?.data ?? [];

  const statusFilters = useMemo(() => ["All", "Draft", "Scheduled", "Sent", "Archived"], []);

  const statusIndex =
    statusFilter === "all"
      ? 0
      : statusFilter === "DRAFT"
        ? 1
        : statusFilter === "SCHEDULED"
          ? 2
          : statusFilter === "SENT"
            ? 3
            : 4;

  const toggleSelected = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (campaign: NotificationCampaign) => {
    setEditing(campaign);
    setForm({
      title: campaign.title,
      message: campaign.message,
      type: campaign.type,
      priority: campaign.priority,
      audience: campaign.audience,
      audienceUserId: campaign.audienceUserId ?? "",
      channels: campaign.channels,
      scheduleAt: campaign.scheduleAt ? campaign.scheduleAt.slice(0, 16) : "",
      expiresAt: campaign.expiresAt ? campaign.expiresAt.slice(0, 16) : "",
      actionLabel: campaign.actionLabel ?? "",
      actionUrl: campaign.actionUrl ?? "",
      status: campaign.status,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const toggleChannel = (channel: string) => {
    setForm((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((item) => item !== channel)
        : [...prev.channels, channel],
    }));
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    message: form.message.trim(),
    type: form.type.trim() || "GENERAL",
    priority: form.priority as NotificationCampaign["priority"],
    audience: form.audience,
    audienceUserId: form.audience === "INDIVIDUAL" ? form.audienceUserId : undefined,
    channels: form.channels,
    scheduleAt: form.scheduleAt ? new Date(form.scheduleAt).toISOString() : undefined,
    expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
    actionLabel: form.actionLabel.trim() || undefined,
    actionUrl: form.actionUrl.trim() || undefined,
    status: form.status as NotificationCampaign["status"],
  });

  const handleSave = async () => {
    if (!form.title.trim() || !form.message.trim() || form.channels.length === 0) {
      showToast("Please complete required fields and select at least one channel");
      return;
    }
    if (form.audience === "INDIVIDUAL" && !form.audienceUserId) {
      showToast("Select a user for individual audience");
      return;
    }

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, ...buildPayload() });
        showToast("Notification updated ✓");
      } else {
        await createMutation.mutateAsync(buildPayload());
        showToast("Notification created ✓");
      }
      closeModal();
    } catch {
      showToast("Failed to save notification");
    }
  };

  const rows = campaigns.map((campaign) => [
    <input
      key={`${campaign.id}-select`}
      type="checkbox"
      checked={selected.includes(campaign.id)}
      onChange={() => toggleSelected(campaign.id)}
    />,
    <UserCell
      key={`${campaign.id}-recipient`}
      firstName={recipientLabel(campaign)}
      sub={campaign.type}
      seed={campaign.id}
    />,
    campaign.type,
    formatChannels(campaign.channels),
    campaign.title,
    formatRelativeTime(campaign.sentAt ?? campaign.createdAt),
    statusChip(campaign.status),
    <div key={`${campaign.id}-actions`} className="btn-row">
      <AdminButton onClick={() => { setPreviewCampaign(campaign); setPreviewOpen(true); }}>Preview</AdminButton>
      <AdminButton onClick={() => openEdit(campaign)}>Edit</AdminButton>
      <AdminButton onClick={() => duplicateMutation.mutateAsync(campaign.id).then(() => showToast("Duplicated ✓"))}>
        Duplicate
      </AdminButton>
      {campaign.status !== "SENT" ? (
        <AdminButton variant="green" onClick={() => sendMutation.mutateAsync(campaign.id).then(() => showToast("Notification sent ✓"))}>
          Send
        </AdminButton>
      ) : null}
      <AdminButton
        variant="danger"
        onClick={() => deleteMutation.mutateAsync(campaign.id).then(() => showToast("Deleted"))}
      >
        Delete
      </AdminButton>
    </div>,
  ]);

  return (
    <>
      <StatCardRow
        items={[
          {
            ic: "ic1",
            icon: "🔔",
            num: formatNumber(stats?.totalSent ?? 0),
            label: "Sent (30 days)",
            tag: "All channels",
            tagClass: "tt-b",
          },
          {
            ic: "ic2",
            icon: "✅",
            num: `${stats?.deliveryRate ?? 0}%`,
            label: "Delivery Rate",
            tag: "Last 30 days",
            tagClass: "tt-g",
          },
          {
            ic: "ic3",
            icon: "📧",
            num: formatNumber(stats?.emailCount ?? 0),
            label: "Email",
            tag: `${stats?.emailShare ?? 0}%`,
            tagClass: "tt-b",
          },
          {
            ic: "ic4",
            icon: "📱",
            num: formatNumber(stats?.smsPushCount ?? 0),
            label: "SMS / Push",
            tag: `${stats?.smsPushShare ?? 0}%`,
            tagClass: "tt-b",
          },
        ]}
      />

      <AdminPanel title="📈 Delivery Statistics" bodyClassName="panel-bd">
        <div className="kv-grid">
          <div className="kv-card"><strong>{formatNumber(stats?.totalSent ?? 0)}</strong><span>Total Sent</span></div>
          <div className="kv-card"><strong>{formatNumber(stats?.delivered ?? 0)}</strong><span>Delivered</span></div>
          <div className="kv-card"><strong>{formatNumber(stats?.readCount ?? 0)}</strong><span>Read</span></div>
          <div className="kv-card"><strong>{formatNumber(stats?.failed ?? 0)}</strong><span>Failed</span></div>
        </div>
      </AdminPanel>

      <AdminPanel title="Filters & Search" bodyClassName="panel-bd">
        <div className="flt-row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <FilterPills
            filters={statusFilters}
            activeIndex={statusIndex}
            onChange={(index) => {
              const map = ["all", "DRAFT", "SCHEDULED", "SENT", "ARCHIVED"];
              setStatusFilter(map[index] ?? "all");
              setPage(1);
            }}
          />
          <div className="panel-search">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search notifications..."
            />
          </div>
        </div>
      </AdminPanel>

      <PanelTable
        title="Recent Notification Log"
        actions={
          <>
            <AdminButton variant="primary" onClick={openCreate}>+ New Notification</AdminButton>
            <AdminButton
              onClick={() => {
                if (!selected.length) return showToast("Select notifications first");
                bulkSendMutation.mutateAsync(selected).then(() => showToast("Bulk send complete ✓"));
              }}
            >
              Bulk Send
            </AdminButton>
            <AdminButton
              onClick={() => {
                if (!selected.length) return showToast("Select notifications first");
                bulkArchiveMutation.mutateAsync(selected).then(() => showToast("Archived ✓"));
              }}
            >
              Bulk Archive
            </AdminButton>
            <AdminButton
              variant="danger"
              onClick={() => {
                if (!selected.length) return showToast("Select notifications first");
                bulkDeleteMutation.mutateAsync(selected).then(() => {
                  setSelected([]);
                  showToast("Deleted ✓");
                });
              }}
            >
              Bulk Delete
            </AdminButton>
          </>
        }
        headers={["", "Recipient", "Type", "Channel", "Message", "Sent", "Status", "Actions"]}
        rows={rows}
        loading={campaignsQuery.isLoading}
        emptyMessage="No notifications found"
        pagerInfo={meta ? `Showing ${campaigns.length} of ${meta.total} notifications` : undefined}
        page={meta?.page}
        totalPages={meta?.totalPages}
        onPageChange={setPage}
      />

      {modalOpen ? (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-hd">
              <h3>{editing ? "Edit Notification" : "New Notification"}</h3>
              <button type="button" className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-bd">
              <FormGrid>
                <FormItem label="Title" full>
                  <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
                </FormItem>
                <FormItem label="Message" full>
                  <textarea rows={4} value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} />
                </FormItem>
                <FormItem label="Type">
                  <input value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} />
                </FormItem>
                <FormItem label="Priority">
                  <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
                    {NOTIFICATION_PRIORITIES.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </FormItem>
                <FormItem label="Audience">
                  <select value={form.audience} onChange={(e) => setForm((p) => ({ ...p, audience: e.target.value }))}>
                    {NOTIFICATION_AUDIENCES.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </FormItem>
                <FormItem label="Status">
                  <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                    {CAMPAIGN_STATUSES.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </FormItem>
                {form.audience === "INDIVIDUAL" ? (
                  <FormItem label="Select User" full>
                    <select
                      value={form.audienceUserId}
                      onChange={(e) => setForm((p) => ({ ...p, audienceUserId: e.target.value }))}
                    >
                      <option value="">Choose user...</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({user.email})
                        </option>
                      ))}
                    </select>
                  </FormItem>
                ) : null}
                <FormItem label="Channels" full>
                  <div className="btn-row">
                    {NOTIFICATION_CHANNELS.map((channel) => (
                      <button
                        key={channel.value}
                        type="button"
                        className={`flt${form.channels.includes(channel.value) ? " on" : ""}`}
                        onClick={() => toggleChannel(channel.value)}
                      >
                        {channel.label}
                      </button>
                    ))}
                  </div>
                </FormItem>
                <FormItem label="Schedule Date">
                  <input
                    type="datetime-local"
                    value={form.scheduleAt}
                    onChange={(e) => setForm((p) => ({ ...p, scheduleAt: e.target.value }))}
                  />
                </FormItem>
                <FormItem label="Expiry Date">
                  <input
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
                  />
                </FormItem>
                <FormItem label="Action Button Label">
                  <input value={form.actionLabel} onChange={(e) => setForm((p) => ({ ...p, actionLabel: e.target.value }))} />
                </FormItem>
                <FormItem label="Redirect URL">
                  <input value={form.actionUrl} onChange={(e) => setForm((p) => ({ ...p, actionUrl: e.target.value }))} />
                </FormItem>
              </FormGrid>
            </div>
            <div className="modal-ft">
              <AdminButton onClick={closeModal}>Cancel</AdminButton>
              <AdminButton variant="primary" onClick={handleSave}>
                {editing ? "Save Changes" : "Create Notification"}
              </AdminButton>
            </div>
          </div>
        </div>
      ) : null}

      {previewOpen && previewCampaign ? (
        <div className="modal-overlay" onClick={() => setPreviewOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hd">
              <h3>Notification Preview</h3>
              <button type="button" className="modal-close" onClick={() => setPreviewOpen(false)}>✕</button>
            </div>
            <div className="modal-bd">
              <div className="fg-item"><label>Title</label><strong>{previewCampaign.title}</strong></div>
              <div className="fg-item"><label>Message</label><p>{previewCampaign.message}</p></div>
              <div className="fg-item"><label>Audience</label><span>{recipientLabel(previewCampaign)}</span></div>
              <div className="fg-item"><label>Channels</label><span>{formatChannels(previewCampaign.channels)}</span></div>
              {previewCampaign.actionUrl ? (
                <div className="fg-item">
                  <label>Action</label>
                  <a className="panel-link" href={previewCampaign.actionUrl}>{previewCampaign.actionLabel ?? "Open"}</a>
                </div>
              ) : null}
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
