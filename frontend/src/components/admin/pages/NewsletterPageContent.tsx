"use client";

import { useMemo, useState } from "react";
import { AdminRichTextEditor } from "@/components/admin/ui/AdminRichTextEditor";
import {
  AdminButton,
  AdminPanel,
  FilterPills,
  FormGrid,
  FormItem,
  PanelTable,
  StatCardRow,
  StatusChip,
} from "@/components/admin/ui/AdminPrimitives";
import { useAdminUiStore } from "@/store/admin-ui.store";
import {
  exportNewsletterSubscribersCsv,
  useAddNewsletterSubscriber,
  useCreateNewsletterCampaign,
  useDeleteNewsletterCampaign,
  useDeleteNewsletterSubscriber,
  useNewsletterCampaigns,
  useNewsletterStats,
  useNewsletterSubscribers,
  useScheduleNewsletterCampaign,
  useSendNewsletterCampaign,
  useUpdateNewsletterCampaign,
  type NewsletterCampaign,
  type NewsletterSubscriber,
} from "@/services/newsletter-api-hooks";

const STATUS_FILTERS = ["All", "Active", "Inactive"] as const;
const STATUS_MAP: Record<(typeof STATUS_FILTERS)[number], "all" | "active" | "inactive"> = {
  All: "all",
  Active: "active",
  Inactive: "inactive",
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function campaignStatusChip(status: NewsletterCampaign["status"]) {
  if (status === "SENT") return { label: "Sent", className: "ch-g" };
  if (status === "SCHEDULED") return { label: "Scheduled", className: "ch-b" };
  return { label: "Draft", className: "ch-a" };
}

export function NewsletterPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const statsQuery = useNewsletterStats();
  const [subPage, setSubPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusIdx, setStatusIdx] = useState(0);
  const [viewing, setViewing] = useState<NewsletterSubscriber | null>(null);
  const [manualEmail, setManualEmail] = useState("");

  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [campaignDraft, setCampaignDraft] = useState({
    subject: "",
    previewText: "",
    bodyHtml: "",
    articleLink: "",
    audience: "ACTIVE" as "ALL" | "ACTIVE",
    scheduledAt: "",
  });
  const [showPreview, setShowPreview] = useState(false);

  const subsQuery = useNewsletterSubscribers({
    page: subPage,
    limit: 15,
    search: search || undefined,
    status: STATUS_MAP[STATUS_FILTERS[statusIdx]],
  });
  const campaignsQuery = useNewsletterCampaigns({ page: 1, limit: 20 });

  const addSubscriber = useAddNewsletterSubscriber();
  const deleteSubscriber = useDeleteNewsletterSubscriber();
  const createCampaign = useCreateNewsletterCampaign();
  const updateCampaign = useUpdateNewsletterCampaign();
  const deleteCampaign = useDeleteNewsletterCampaign();
  const sendCampaign = useSendNewsletterCampaign();
  const scheduleCampaign = useScheduleNewsletterCampaign();

  const stats = statsQuery.data;
  const subscribers = subsQuery.data?.data ?? [];
  const subMeta = subsQuery.data?.meta;
  const campaigns = campaignsQuery.data?.data ?? [];
  const activeCount = stats?.active ?? 0;

  const statCards = useMemo(
    () => [
      {
        ic: "ic-b",
        icon: "📬",
        num: String(stats?.total ?? "—"),
        label: "Total Subscribers",
        tag: "All time",
        tagClass: "tg-b",
      },
      {
        ic: "ic-g",
        icon: "✅",
        num: String(stats?.active ?? "—"),
        label: "Active Subscribers",
        tag: "Receiving emails",
        tagClass: "tg-g",
      },
      {
        ic: "ic-a",
        icon: "📨",
        num: String(stats?.campaignsSent ?? "—"),
        label: "Campaigns Sent",
        tag: stats?.lastCampaign ? `Last: ${formatDate(stats.lastCampaign.sentAt)}` : "No sends yet",
        tagClass: "tg-a",
      },
    ],
    [stats],
  );

  const subRows = subscribers.map((s) => {
    const status = s.isActive ? { label: "Active", className: "ch-g" } : { label: "Inactive", className: "ch-a" };
    return [
      s.email,
      <span key={`src-${s.id}`} style={{ fontSize: ".78rem", color: "var(--gray-500)" }}>
        {s.source || "—"}
      </span>,
      formatDate(s.createdAt),
      <StatusChip key={`st-${s.id}`} label={status.label} className={status.className} />,
      <div key={`a-${s.id}`} className="btn-row">
        <AdminButton onClick={() => setViewing(s)}>View</AdminButton>
        <AdminButton
          variant="danger"
          onClick={() => {
            if (!confirm("Remove this subscriber?")) return;
            deleteSubscriber.mutate(s.id, { onSuccess: () => showToast("Subscriber removed") });
          }}
        >
          Remove
        </AdminButton>
      </div>,
    ];
  });

  const resetCampaignForm = () => {
    setCampaignId(null);
    setCampaignDraft({
      subject: "",
      previewText: "",
      bodyHtml: "",
      articleLink: "",
      audience: "ACTIVE",
      scheduledAt: "",
    });
    setShowPreview(false);
  };

  const loadCampaign = (campaign: NewsletterCampaign) => {
    setCampaignId(campaign.id);
    setCampaignDraft({
      subject: campaign.subject,
      previewText: campaign.previewText ?? "",
      bodyHtml: campaign.bodyHtml,
      articleLink: campaign.articleLink ?? "",
      audience: campaign.audience,
      scheduledAt: campaign.scheduledAt ? campaign.scheduledAt.slice(0, 16) : "",
    });
  };

  const saveCampaign = (status: "DRAFT" | "SCHEDULED" = "DRAFT") => {
    if (!campaignDraft.subject.trim() || !campaignDraft.bodyHtml.trim()) {
      showToast("⚠️ Subject and email content are required");
      return;
    }
    const payload = {
      subject: campaignDraft.subject.trim(),
      previewText: campaignDraft.previewText.trim() || undefined,
      bodyHtml: campaignDraft.bodyHtml,
      articleLink: campaignDraft.articleLink.trim() || undefined,
      audience: campaignDraft.audience,
      status,
      scheduledAt: status === "SCHEDULED" && campaignDraft.scheduledAt ? campaignDraft.scheduledAt : undefined,
    };

    if (campaignId) {
      updateCampaign.mutate(
        { id: campaignId, ...payload },
        {
          onSuccess: () => {
            if (status === "SCHEDULED" && campaignDraft.scheduledAt) {
              scheduleCampaign.mutate(
                { id: campaignId, scheduledAt: new Date(campaignDraft.scheduledAt).toISOString() },
                { onSuccess: () => showToast("📅 Campaign scheduled") },
              );
            } else {
              showToast(status === "DRAFT" ? "Draft saved" : "Campaign updated");
            }
          },
        },
      );
      return;
    }

    createCampaign.mutate(payload, {
      onSuccess: (created) => {
        setCampaignId(created.id);
        if (status === "SCHEDULED" && campaignDraft.scheduledAt) {
          scheduleCampaign.mutate(
            { id: created.id, scheduledAt: new Date(campaignDraft.scheduledAt).toISOString() },
            { onSuccess: () => showToast("📅 Campaign scheduled") },
          );
        } else {
          showToast("Draft saved");
        }
      },
    });
  };

  const sendNow = () => {
    const runSend = (id: string) => {
      if (!activeCount) {
        showToast("⚠️ No active subscribers to send to");
        return;
      }
      sendCampaign.mutate(id, {
        onSuccess: (result) => {
          showToast(`📤 Newsletter sent to ${result.recipientCount} subscriber${result.recipientCount === 1 ? "" : "s"}`);
          resetCampaignForm();
        },
      });
    };

    if (campaignId) {
      runSend(campaignId);
      return;
    }

    if (!campaignDraft.subject.trim() || !campaignDraft.bodyHtml.trim()) {
      showToast("⚠️ Please add subject and message first");
      return;
    }

    createCampaign.mutate(
      {
        subject: campaignDraft.subject.trim(),
        previewText: campaignDraft.previewText.trim() || undefined,
        bodyHtml: campaignDraft.bodyHtml,
        articleLink: campaignDraft.articleLink.trim() || undefined,
        audience: campaignDraft.audience,
        status: "DRAFT",
      },
      { onSuccess: (created) => runSend(created.id) },
    );
  };

  return (
    <>
      <StatCardRow items={statCards} />

      <AdminPanel title="🔎 Search & Filter" bodyClassName="panel-bd">
        <div className="search-bar" style={{ marginBottom: 12 }}>
          <input
            placeholder="Search by email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSearch(searchInput.trim());
                setSubPage(1);
              }
            }}
          />
          <AdminButton
            onClick={() => {
              setSearch(searchInput.trim());
              setSubPage(1);
            }}
          >
            Search
          </AdminButton>
        </div>
        <FilterPills
          filters={[...STATUS_FILTERS]}
          activeIndex={statusIdx}
          onChange={(idx) => {
            setStatusIdx(idx);
            setSubPage(1);
          }}
        />
      </AdminPanel>

      <PanelTable
        title={`📬 Subscribers (${subMeta?.total ?? 0})`}
        actions={
          subMeta?.total ? (
            <AdminButton onClick={() => void exportNewsletterSubscribersCsv()}>⬇ Export CSV</AdminButton>
          ) : undefined
        }
        headers={["Email", "Source", "Subscribed", "Status", "Actions"]}
        rows={subRows}
        loading={subsQuery.isLoading}
        emptyMessage="No subscribers yet. Signups from the website footer, blog, home page, and contact form appear here automatically."
        pagerInfo={
          subMeta ? `Showing ${subscribers.length} of ${subMeta.total} subscribers` : undefined
        }
        page={subPage}
        totalPages={subMeta?.totalPages ?? 1}
        onPageChange={setSubPage}
      />

      <AdminPanel title="✉️ Compose & Send Newsletter" bodyClassName="panel-bd">
        <p style={{ fontSize: ".78rem", color: "var(--gray-500)", marginBottom: 12 }}>
          Write your newsletter, choose the audience, then send immediately or schedule it. Sending records the campaign and delivers via SMTP to all matching subscribers.
        </p>
        <FormGrid>
          <FormItem label="Subject" full>
            <input
              value={campaignDraft.subject}
              onChange={(e) => setCampaignDraft((d) => ({ ...d, subject: e.target.value }))}
              placeholder="New from DrInsight — this week's article"
            />
          </FormItem>
          <FormItem label="Preview Text" full>
            <input
              value={campaignDraft.previewText}
              onChange={(e) => setCampaignDraft((d) => ({ ...d, previewText: e.target.value }))}
              placeholder="Short inbox preview line"
            />
          </FormItem>
          <FormItem label="Email Content" full>
            <AdminRichTextEditor
              value={campaignDraft.bodyHtml}
              onChange={(html) => setCampaignDraft((d) => ({ ...d, bodyHtml: html }))}
              placeholder="Paste your message to subscribers here…"
            />
          </FormItem>
          <FormItem label="Blog / Article Link" full>
            <input
              value={campaignDraft.articleLink}
              onChange={(e) => setCampaignDraft((d) => ({ ...d, articleLink: e.target.value }))}
              placeholder="https://www.drinsight.org/blog/…"
            />
          </FormItem>
          <FormItem label="Audience">
            <select
              value={campaignDraft.audience}
              onChange={(e) =>
                setCampaignDraft((d) => ({ ...d, audience: e.target.value as "ALL" | "ACTIVE" }))
              }
            >
              <option value="ACTIVE">Active subscribers only ({activeCount})</option>
              <option value="ALL">All subscribers ({stats?.total ?? 0})</option>
            </select>
          </FormItem>
          <FormItem label="Schedule For">
            <input
              type="datetime-local"
              value={campaignDraft.scheduledAt}
              onChange={(e) => setCampaignDraft((d) => ({ ...d, scheduledAt: e.target.value }))}
            />
          </FormItem>
        </FormGrid>
        <div className="btn-row" style={{ marginTop: 12 }}>
          <AdminButton variant="primary" onClick={() => !sendCampaign.isPending && sendNow()}>
            📤 Send to Audience ({campaignDraft.audience === "ALL" ? stats?.total ?? 0 : activeCount})
          </AdminButton>
          <AdminButton onClick={() => saveCampaign("DRAFT")}>💾 Save Draft</AdminButton>
          <AdminButton
            onClick={() => {
              if (!campaignDraft.scheduledAt) {
                showToast("⚠️ Pick a schedule date/time first");
                return;
              }
              saveCampaign("SCHEDULED");
            }}
          >
            📅 Schedule
          </AdminButton>
          <AdminButton onClick={() => setShowPreview((v) => !v)}>👁 Preview</AdminButton>
          {campaignId ? <AdminButton onClick={resetCampaignForm}>New Campaign</AdminButton> : null}
        </div>
        {showPreview ? (
          <div
            style={{
              marginTop: 12,
              border: "1px solid var(--gray-200)",
              borderRadius: 10,
              padding: "14px 16px",
              background: "#fff",
            }}
          >
            <div
              style={{
                fontSize: ".72rem",
                color: "var(--gray-400)",
                textTransform: "uppercase",
                letterSpacing: ".08em",
                marginBottom: 6,
              }}
            >
              Email preview
            </div>
            <div style={{ fontWeight: 700, fontSize: ".95rem", marginBottom: 6 }}>
              {campaignDraft.subject || "DrInsight Newsletter"}
            </div>
            {campaignDraft.previewText ? (
              <div style={{ fontSize: ".78rem", color: "var(--gray-500)", marginBottom: 8 }}>
                {campaignDraft.previewText}
              </div>
            ) : null}
            <div
              className="rte-preview"
              style={{ fontSize: ".86rem", color: "var(--gray-700)", lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{ __html: campaignDraft.bodyHtml || "<p>Type a message to preview.</p>" }}
            />
            {campaignDraft.articleLink ? (
              <div style={{ marginTop: 10 }}>
                <a
                  href={campaignDraft.articleLink}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-block",
                    background: "var(--blue)",
                    color: "#fff",
                    padding: "8px 16px",
                    borderRadius: 8,
                    fontSize: ".8rem",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Read the full article →
                </a>
              </div>
            ) : null}
          </div>
        ) : null}

        <div style={{ marginTop: 16 }}>
          {campaigns.length ? (
            <>
              <div style={{ fontSize: ".82rem", fontWeight: 700, marginBottom: 8 }}>
                📨 Campaign History ({campaigns.length})
              </div>
              {campaigns.map((c) => {
                const chip = campaignStatusChip(c.status);
                const plain = c.bodyHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
                return (
                  <div
                    key={c.id}
                    style={{
                      border: "1px solid var(--gray-200)",
                      borderRadius: 8,
                      padding: "10px 12px",
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 600, fontSize: ".86rem" }}>{c.subject}</div>
                      <StatusChip label={chip.label} className={chip.className} />
                    </div>
                    <div style={{ fontSize: ".78rem", color: "var(--gray-500)", margin: "3px 0", whiteSpace: "pre-wrap" }}>
                      {plain.slice(0, 140)}
                      {plain.length > 140 ? "…" : ""}
                    </div>
                    {c.articleLink ? (
                      <a
                        href={c.articleLink}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: ".76rem", color: "var(--blue)", wordBreak: "break-all" }}
                      >
                        {c.articleLink}
                      </a>
                    ) : null}
                    <div style={{ fontSize: ".72rem", color: "var(--gray-400)", marginTop: 4 }}>
                      {c.status === "SENT"
                        ? `Sent to ${c.recipientCount} subscriber${c.recipientCount === 1 ? "" : "s"} · ${c.sentAt ? formatDateTime(c.sentAt) : ""}`
                        : c.status === "SCHEDULED" && c.scheduledAt
                          ? `Scheduled for ${formatDateTime(c.scheduledAt)}`
                          : `Draft · ${formatDateTime(c.updatedAt)}`}
                    </div>
                    <div className="btn-row" style={{ marginTop: 8 }}>
                      {c.status !== "SENT" ? (
                        <>
                          <AdminButton onClick={() => loadCampaign(c)}>Edit</AdminButton>
                          <AdminButton
                            variant="danger"
                            onClick={() => {
                              if (!confirm("Delete this campaign?")) return;
                              deleteCampaign.mutate(c.id, { onSuccess: () => showToast("Campaign deleted") });
                            }}
                          >
                            Delete
                          </AdminButton>
                        </>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div style={{ fontSize: ".76rem", color: "var(--gray-400)" }}>No newsletters sent yet.</div>
          )}
        </div>
      </AdminPanel>

      <AdminPanel
        title="➕ Add Subscriber Manually"
        bodyClassName="panel-bd"
        actions={
          <AdminButton
            variant="primary"
            onClick={() => {
              if (!manualEmail.trim()) return;
              addSubscriber.mutate(
                { email: manualEmail.trim(), source: "admin" },
                {
                  onSuccess: () => {
                    showToast("Subscriber added");
                    setManualEmail("");
                  },
                  onError: () => showToast("⚠️ Could not add subscriber"),
                },
              );
            }}
          >
            Add
          </AdminButton>
        }
      >
        <FormGrid>
          <FormItem label="Email" full>
            <input
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
              placeholder="reader@example.com"
            />
          </FormItem>
        </FormGrid>
      </AdminPanel>

      {viewing ? (
        <div className="modal-overlay" onClick={() => setViewing(null)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-hd">
              <h3>Subscriber Details</h3>
              <button type="button" className="modal-close" onClick={() => setViewing(null)}>
                ✕
              </button>
            </div>
            <div className="modal-bd">
              <FormGrid>
                <FormItem label="Email" full>
                  <input value={viewing.email} readOnly />
                </FormItem>
                <FormItem label="Source">
                  <input value={viewing.source ?? "—"} readOnly />
                </FormItem>
                <FormItem label="Status">
                  <input value={viewing.isActive ? "Active" : "Inactive"} readOnly />
                </FormItem>
                <FormItem label="Subscribed">
                  <input value={formatDateTime(viewing.createdAt)} readOnly />
                </FormItem>
              </FormGrid>
            </div>
            <div className="modal-ft">
              <AdminButton onClick={() => setViewing(null)}>Close</AdminButton>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
