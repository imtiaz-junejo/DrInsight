"use client";

import { useMemo, useState } from "react";
import {
  AdminButton,
  AdminPanel,
  AdminTable,
  StatCardRow,
  ToggleSwitch,
} from "@/components/admin/ui/AdminPrimitives";
import { formatNumber } from "@/lib/admin-utils";
import { formatDate } from "@/lib/data-mappers";
import { useAdminUiStore } from "@/store/admin-ui.store";
import {
  useAdminToggleWhrSubscription,
  useCreateWhrSchedule,
  useDeleteWhrSchedule,
  useRetryWhrLog,
  useRunWhrScheduler,
  useSaveWhrTemplate,
  useToggleWhrSchedule,
  useUpdateWhrSchedule,
  useUpdateWhrSettings,
  useWhrDashboard,
  useWhrLogs,
  useWhrSchedules,
  useWhrSettings,
  useWhrSubscriptions,
  useWhrTemplates,
  type PregnancyScheduleRow,
  type WhrToolType,
} from "@/services/whr-api-hooks";

const TABS = [
  ["dashboard", "📊 Dashboard"],
  ["settings", "⚙️ Reminder Settings"],
  ["schedule", "🤰 Pregnancy Schedule Manager"],
  ["templates", "✉️ Email Templates"],
  ["logs", "📋 Reminder Logs"],
] as const;

type TabId = (typeof TABS)[number][0];

const TOOL_LABEL: Record<WhrToolType, string> = {
  PREGNANCY: "🤰 Pregnancy Due Date",
  OVULATION: "🌸 Ovulation Planner",
  PERIOD: "🩸 Period Tracker",
};

function subscriptionStatusLabel(row: { enabled: boolean; status?: string; cycleKey?: string | null }) {
  if (!row.enabled || row.status === "DISABLED_BY_ADMIN" || row.status === "CANCELLED") {
    return row.status === "DISABLED_BY_ADMIN" ? "⛔ Disabled by admin" : "⛔ Disabled";
  }
  if (row.status === "PENDING" || !row.cycleKey) return "⏳ Pending calculator";
  if (row.status === "SCHEDULED") return "✓ Scheduled";
  return row.status ?? "—";
}

export function WomensHealthRemindersPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const [tab, setTab] = useState<TabId>("dashboard");
  const dashboard = useWhrDashboard();
  const subscriptions = useWhrSubscriptions();
  const settings = useWhrSettings();
  const schedules = useWhrSchedules();
  const templates = useWhrTemplates();
  const [logFilters, setLogFilters] = useState({ tool: "All", status: "All", date: "", q: "" });
  const logs = useWhrLogs(logFilters);
  const updateSettings = useUpdateWhrSettings();
  const toggleSub = useAdminToggleWhrSubscription();
  const runScheduler = useRunWhrScheduler();
  const retryLog = useRetryWhrLog();
  const [editScheduleId, setEditScheduleId] = useState<string | null>(null);
  const createSchedule = useCreateWhrSchedule();
  const updateSchedule = useUpdateWhrSchedule();
  const toggleSchedule = useToggleWhrSchedule();
  const deleteSchedule = useDeleteWhrSchedule();
  const saveTemplate = useSaveWhrTemplate();

  const stats = dashboard.data;
  const schedRows = schedules.data ?? [];

  const scheduleEditor = useMemo(() => {
    if (editScheduleId === null) return null;
    const existing =
      editScheduleId === "new"
        ? null
        : schedRows.find((s) => s.id === editScheduleId) ?? null;
    return (
      <AdminPanel title={existing ? `✏️ Edit Schedule — Week ${existing.weekRange}` : "➕ Add New Schedule"}>
        <form
          className="whr-schedule-form"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const payload = {
              weekRange: String(fd.get("weekRange") || ""),
              title: String(fd.get("title") || ""),
              subject: String(fd.get("subject") || ""),
              tests: String(fd.get("tests") || ""),
              visitReminder: String(fd.get("visitReminder") || ""),
              careInstructions: String(fd.get("careInstructions") || ""),
              bodyHtml: String(fd.get("bodyHtml") || ""),
            };
            if (!payload.weekRange || !payload.title || !payload.subject) {
              showToast("⚠️ Week, Title and Subject are required");
              return;
            }
            if (existing) {
              updateSchedule.mutate(
                { id: existing.id, ...payload },
                { onSuccess: () => { showToast("✅ Schedule updated"); setEditScheduleId(null); } },
              );
            } else {
              createSchedule.mutate(payload, {
                onSuccess: () => { showToast("✅ Schedule added"); setEditScheduleId(null); },
              });
            }
          }}
        >
          <div className="form-row">
            <div className="form-group">
              <label>Pregnancy Week</label>
              <input name="weekRange" defaultValue={existing?.weekRange ?? ""} placeholder="e.g. 24–28" />
            </div>
            <div className="form-group">
              <label>Reminder Title</label>
              <input name="title" defaultValue={existing?.title ?? ""} />
            </div>
          </div>
          <div className="form-group">
            <label>Email Subject</label>
            <input name="subject" defaultValue={existing?.subject ?? ""} />
          </div>
          <div className="form-group">
            <label>Recommended Tests</label>
            <input name="tests" defaultValue={existing?.tests ?? ""} />
          </div>
          <div className="form-group">
            <label>Doctor Visit Reminder</label>
            <input name="visitReminder" defaultValue={existing?.visitReminder ?? ""} />
          </div>
          <div className="form-group">
            <label>Care Instructions</label>
            <textarea name="careInstructions" rows={2} defaultValue={existing?.careInstructions ?? ""} />
          </div>
          <div className="form-group">
            <label>Email Body</label>
            <textarea name="bodyHtml" rows={6} defaultValue={existing?.bodyHtml ?? ""} />
          </div>
          <div className="btn-row">
            <AdminButton variant="primary" type="submit">💾 Save Schedule</AdminButton>
            <AdminButton type="button" onClick={() => setEditScheduleId(null)}>Cancel</AdminButton>
          </div>
        </form>
      </AdminPanel>
    );
  }, [editScheduleId, schedRows, createSchedule, updateSchedule, showToast]);

  return (
    <>
      <div className="flt-row" style={{ marginBottom: 16 }}>
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`flt${tab === id ? " on" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && stats ? (
        <>
          <StatCardRow
            items={[
              { ic: "ic1", icon: "👥", num: formatNumber(stats.users), label: "Total Users", tag: "All tools", tagClass: "tt-b" },
              { ic: "ic2", icon: "🤰", num: String(stats.pregUsers), label: "Pregnancy Reminder Users", tag: "Care schedules", tagClass: "tt-g" },
              { ic: "ic3", icon: "🌸", num: String(stats.ovUsers), label: "Ovulation Reminder Users", tag: "1 email / cycle", tagClass: "tt-a" },
              { ic: "ic4", icon: "🩸", num: String(stats.perUsers), label: "Period Reminder Users", tag: "1 email / cycle", tagClass: "tt-b" },
            ]}
          />
          <StatCardRow
            items={[
              { ic: "ic2", icon: "📤", num: String(stats.sentToday), label: "Emails Sent Today", tag: "Since 06:00", tagClass: "tt-g" },
              { ic: "ic1", icon: "🗓️", num: String(stats.scheduled), label: "Emails Scheduled", tag: "In queue", tagClass: "tt-b" },
              { ic: "ic4", icon: "⚠️", num: String(stats.failed), label: "Failed Emails", tag: stats.failed ? "Retry pending" : "All clear", tagClass: stats.failed ? "tt-r" : "tt-g" },
              { ic: "ic3", icon: "⏳", num: String(stats.pending), label: "Pending Emails", tag: "Due today", tagClass: "tt-a" },
            ]}
          />
          <AdminPanel
            title="🤖 Background Scheduler"
            actions={
              <AdminButton
                variant="primary"
                onClick={() =>
                  runScheduler.mutate(undefined, {
                    onSuccess: (r) =>
                      showToast(
                        `🤖 Scheduler run complete — ${r.queued} queued, ${r.retried} retried, ${r.duplicates} duplicates`,
                      ),
                  })
                }
              >
                ▶ Run Scheduler Now
              </AdminButton>
            }
          >
            <p style={{ fontSize: "0.82rem", color: "var(--gray-600)", lineHeight: 1.7, margin: 0 }}>
              The scheduler runs automatically every day at 06:00. On each run it checks ovulation and period reminders due today,
              checks pregnancy weekly schedules due today, queues emails, skips duplicates, records logs, and retries failed emails.
              <br />
              <span style={{ color: "var(--gray-500)" }}>
                Last run: <strong>{stats.lastRun}</strong> · Next run: <strong>{stats.nextRun}</strong>
              </span>
            </p>
          </AdminPanel>
          <AdminPanel title="📮 Reminder Email Subscriptions">
            <p style={{ fontSize: "0.74rem", color: "var(--gray-500)", margin: "0 0 12px" }}>
              Auto-added when users submit their email — admin can disable any time
            </p>
            <AdminTable
              headers={["Patient", "Email", "Tool", "Subscribed", "Source", "Status", "Action"]}
              rows={(subscriptions.data ?? []).map((row) => [
                row.patient,
                <strong key={`${row.id}-email`}>{row.email}</strong>,
                TOOL_LABEL[row.tool],
                formatDate(row.added),
                row.source === "tools_page" ? "Tools page" : row.source,
                subscriptionStatusLabel(row),
                <AdminButton
                  key={`${row.id}-btn`}
                  variant={row.enabled ? "danger" : "primary"}
                  onClick={() =>
                    toggleSub.mutate(
                      { email: row.email, tool: row.tool, enabled: !row.enabled },
                      {
                        onSuccess: () =>
                          showToast(
                            row.enabled
                              ? `🔕 Reminders disabled for ${row.email}`
                              : `📧 Reminders re-enabled for ${row.email}`,
                          ),
                      },
                    )
                  }
                >
                  {row.enabled ? "Disable" : "Enable"}
                </AdminButton>,
              ])}
              emptyMessage="No subscriptions yet — they appear when users submit email on the tools page."
            />
          </AdminPanel>
        </>
      ) : null}

      {tab === "settings" && settings.data ? (
        <AdminPanel
          title="⚙️ Reminder Settings"
          actions={
            <AdminButton
              variant="primary"
              onClick={() => {
                const s = settings.data!;
                updateSettings.mutate(s, { onSuccess: () => showToast("✅ Reminder settings saved") });
              }}
            >
              💾 Save Settings
            </AdminButton>
          }
        >
          {(
            [
              ["globalEnabled", "Enable reminders globally", "Master switch for the whole Women's Health reminder system"],
              ["pregnancyEnabled", "Pregnancy Due Date Calculator", "Weekly pregnancy care schedule emails"],
              ["ovulationEnabled", "Pregnancy Planner (Ovulation)", "One reminder per ovulation cycle"],
              ["periodEnabled", "Menstrual Period Tracker", "One reminder per period cycle"],
              ["queueEnabled", "Queue processing", "Send emails through background queue jobs"],
              ["retryEnabled", "Retry failed emails automatically", "Failed sends are retried on the next scheduler run"],
            ] as const
          ).map(([key, label, desc]) => (
            <div key={key} className="whr-toggle-row">
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.86rem" }}>{label}</div>
                <div style={{ fontSize: "0.76rem", color: "var(--gray-500)" }}>{desc}</div>
              </div>
              <ToggleSwitch
                checked={settings.data[key]}
                onChange={(checked) =>
                  updateSettings.mutate({ [key]: checked }, { onSuccess: () => showToast(`${label} ${checked ? "enabled" : "disabled"}`) })
                }
              />
            </div>
          ))}
          <div className="form-row" style={{ marginTop: 16 }}>
            <div className="form-group">
              <label>Sender Email</label>
              <input
                value={settings.data.senderEmail}
                onChange={(e) => updateSettings.mutate({ senderEmail: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Sender Name</label>
              <input
                value={settings.data.senderName}
                onChange={(e) => updateSettings.mutate({ senderName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Ovulation reminder — days before</label>
              <input
                type="number"
                min={0}
                max={7}
                value={settings.data.ovulationDaysBefore}
                onChange={(e) => updateSettings.mutate({ ovulationDaysBefore: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>Period reminder — days before</label>
              <input
                type="number"
                min={0}
                max={7}
                value={settings.data.periodDaysBefore}
                onChange={(e) => updateSettings.mutate({ periodDaysBefore: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>Retry attempts</label>
              <input
                type="number"
                min={1}
                max={10}
                value={settings.data.retryAttempts}
                onChange={(e) => updateSettings.mutate({ retryAttempts: Number(e.target.value) })}
              />
            </div>
          </div>
        </AdminPanel>
      ) : null}

      {tab === "schedule" ? (
        <>
          {scheduleEditor}
          <AdminPanel
            title="🤰 Pregnancy Care Schedules"
            actions={<AdminButton variant="primary" onClick={() => setEditScheduleId("new")}>➕ Add Schedule</AdminButton>}
          >
            <AdminTable
              headers={["Week", "Title", "Email Subject", "Recommended Tests", "Status", "Actions"]}
              rows={schedRows.map((s: PregnancyScheduleRow) => [
                <strong key={`${s.id}-wk`}>Week {s.weekRange}</strong>,
                s.title,
                <span key={`${s.id}-sub`} style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>{s.subject}</span>,
                <span key={`${s.id}-tests`} style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>{s.tests}</span>,
                s.enabled ? "✓ Enabled" : "Disabled",
                <div key={`${s.id}-act`} className="btn-row">
                  <AdminButton onClick={() => setEditScheduleId(s.id)}>Edit</AdminButton>
                  <AdminButton onClick={() => toggleSchedule.mutate(s.id, { onSuccess: () => showToast(`Week ${s.weekRange} ${s.enabled ? "disabled" : "enabled"}`) })}>
                    {s.enabled ? "Disable" : "Enable"}
                  </AdminButton>
                  <AdminButton variant="danger" onClick={() => deleteSchedule.mutate(s.id, { onSuccess: () => showToast(`🗑️ Deleted Week ${s.weekRange}`) })}>
                    Delete
                  </AdminButton>
                </div>,
              ])}
              emptyMessage="No schedules yet."
            />
            <p style={{ fontSize: "0.74rem", color: "var(--gray-500)", marginTop: 10 }}>
              {schedRows.length} schedules — emails in the same week are combined into one
            </p>
          </AdminPanel>
        </>
      ) : null}

      {tab === "templates" && templates.data ? (
        <>
          <AdminPanel title="✉️ Ovulation Reminder">
            <TemplateEditor
              subject={(templates.data.ovulation?.subject as string) ?? ""}
              body={(templates.data.ovulation?.body as string) ?? ""}
              onSave={(subject, body) =>
                saveTemplate.mutate(
                  { kind: "ovulation", subject, body },
                  { onSuccess: () => showToast("✅ Ovulation template saved") },
                )
              }
            />
          </AdminPanel>
          <AdminPanel title="✉️ Period Reminder">
            <TemplateEditor
              subject={(templates.data.period?.subject as string) ?? ""}
              body={(templates.data.period?.body as string) ?? ""}
              onSave={(subject, body) =>
                saveTemplate.mutate(
                  { kind: "period", subject, body },
                  { onSuccess: () => showToast("✅ Period template saved") },
                )
              }
            />
          </AdminPanel>
          {templates.data.pregnancy.map((s) => (
            <AdminPanel key={s.id} title={`✉️ Week ${s.weekRange} — ${s.title}`}>
              <TemplateEditor
                subject={s.subject}
                body={s.bodyHtml}
                onSave={(subject, body) =>
                  saveTemplate.mutate(
                    { kind: "schedule", id: s.id, subject, body },
                    { onSuccess: () => showToast(`✅ Week ${s.weekRange} template saved`) },
                  )
                }
              />
            </AdminPanel>
          ))}
        </>
      ) : null}

      {tab === "logs" ? (
        <>
          <AdminPanel title="Filters">
            <div className="form-row">
              <div className="form-group">
                <label>Tool</label>
                <select value={logFilters.tool} onChange={(e) => setLogFilters((f) => ({ ...f, tool: e.target.value }))}>
                  {["All", "Pregnancy", "Ovulation", "Period"].map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={logFilters.status} onChange={(e) => setLogFilters((f) => ({ ...f, status: e.target.value }))}>
                  {["All", "Sent", "Pending", "Failed"].map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={logFilters.date} onChange={(e) => setLogFilters((f) => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Search</label>
                <input
                  placeholder="Patient name or email…"
                  value={logFilters.q}
                  onChange={(e) => setLogFilters((f) => ({ ...f, q: e.target.value }))}
                />
              </div>
            </div>
          </AdminPanel>
          <AdminPanel title="📋 Reminder Logs">
            <AdminTable
              headers={["Patient", "Tool", "Email", "Type", "Scheduled", "Sent", "Status", "Error", "Actions"]}
              rows={(logs.data ?? []).map((l) => [
                <strong key={`${l.id}-p`}>{l.patientName ?? "—"}</strong>,
                l.tool,
                l.email,
                l.emailType,
                formatDate(l.scheduledAt),
                l.sentAt ? formatDate(l.sentAt) : "—",
                l.status,
                l.errorMessage ?? "—",
                l.status === "Failed" ? (
                  <AdminButton
                    key={`${l.id}-retry`}
                    variant="primary"
                    onClick={() => retryLog.mutate(l.id, { onSuccess: () => showToast("🔁 Email requeued & delivered") })}
                  >
                    🔁 Retry
                  </AdminButton>
                ) : (
                  "—"
                ),
              ])}
              emptyMessage="No log entries match these filters."
            />
          </AdminPanel>
        </>
      ) : null}
    </>
  );
}

function TemplateEditor({
  subject,
  body,
  onSave,
}: {
  subject: string;
  body: string;
  onSave: (subject: string, body: string) => void;
}) {
  const [localSubject, setLocalSubject] = useState(subject);
  const [localBody, setLocalBody] = useState(body);
  return (
    <div className="form-grid">
      <div className="form-group">
        <label>Subject</label>
        <input value={localSubject} onChange={(e) => setLocalSubject(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Email Body</label>
        <textarea rows={7} value={localBody} onChange={(e) => setLocalBody(e.target.value)} />
      </div>
      <AdminButton variant="primary" onClick={() => onSave(localSubject, localBody)}>
        💾 Save Template
      </AdminButton>
    </div>
  );
}
