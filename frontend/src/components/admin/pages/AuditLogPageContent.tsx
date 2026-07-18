"use client";

import { useMemo, useState } from "react";
import {
  AdminButton,
  FilterPills,
  PanelTable,
  StatCardRow,
  StatusChip,
  UserCell,
} from "@/components/admin/ui/AdminPrimitives";
import { formatNumber } from "@/lib/admin-utils";
import { formatRelativeTime } from "@/lib/data-mappers";
import { useAdminUiStore } from "@/store/admin-ui.store";
import {
  useAcknowledgeAuditAlert,
  useAuditLogs,
} from "@/services/cms-api-hooks";

const CATEGORY_FILTERS = [
  { label: "All Events", value: undefined },
  { label: "Admin Actions", value: "ADMIN" },
  { label: "Auth & Security", value: "AUTH" },
  { label: "Data Access", value: "DATA_ACCESS" },
  { label: "Payments & Payouts", value: "PAYMENTS" },
  { label: "Errors", value: "ERROR" },
] as const;

function severityChip(severity: string) {
  if (severity === "CRITICAL") return { label: "Critical", className: "ch-r" };
  if (severity === "WARNING" || severity === "SENSITIVE") return { label: severity === "SENSITIVE" ? "Sensitive" : "Warning", className: "ch-a" };
  return { label: "Info", className: "ch-gray" };
}

function resultChip(result: string) {
  if (result === "FAILED") return { label: "Failed", className: "ch-r" };
  if (result === "BLOCKED") return { label: "Blocked", className: "ch-r" };
  return { label: "Success", className: "ch-g" };
}

export function AuditLogPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const [filterIndex, setFilterIndex] = useState(0);
  const [page, setPage] = useState(1);
  const category = CATEGORY_FILTERS[filterIndex]?.value;
  const logsQuery = useAuditLogs({ page, limit: 10, category });
  const acknowledge = useAcknowledgeAuditAlert();

  const stats = logsQuery.data?.stats;
  const rows = useMemo(() => {
    return (logsQuery.data?.data ?? []).map((entry) => {
      const sev = severityChip(entry.severity);
      const res = resultChip(entry.result);
      const nameParts = entry.actorName.split(" ");
      return [
        formatRelativeTime(entry.createdAt),
        <UserCell
          key={`actor-${entry.id}`}
          firstName={nameParts[0]}
          lastName={nameParts.slice(1).join(" ") || undefined}
          sub={entry.actorRole ?? entry.actorEmail ?? "—"}
          seed={entry.actorUserId ?? entry.id}
          userId={entry.actorUserId ?? undefined}
        />,
        entry.action,
        entry.target ?? "—",
        entry.ipAddress ?? "—",
        <StatusChip key={`res-${entry.id}`} label={res.label} className={res.className} />,
        <StatusChip key={`sev-${entry.id}`} label={sev.label} className={sev.className} />,
        <AdminButton key={`view-${entry.id}`} onClick={() => showToast("Opening event detail...")}>
          View
        </AdminButton>,
      ];
    });
  }, [logsQuery.data?.data, showToast]);

  const alert = stats?.latestCritical;

  return (
    <>
      <StatCardRow
        items={[
          {
            ic: "ic1",
            icon: "📜",
            num: logsQuery.isLoading ? "—" : formatNumber(stats?.events24h ?? 0),
            label: "Events Logged (24h)",
            tag: "All categories",
            tagClass: "tt-b",
          },
          {
            ic: "ic2",
            icon: "🛠️",
            num: logsQuery.isLoading ? "—" : formatNumber(stats?.adminActions24h ?? 0),
            label: "Admin Actions (24h)",
            tag: "Live data",
            tagClass: "tt-b",
          },
          {
            ic: "ic3",
            icon: "🔓",
            num: logsQuery.isLoading ? "—" : formatNumber(stats?.failedLogins24h ?? 0),
            label: "Failed Logins (24h)",
            tag: "Review",
            tagClass: "tt-a",
          },
          {
            ic: "ic4",
            icon: "🚨",
            num: logsQuery.isLoading ? "—" : formatNumber(stats?.openAlerts ?? 0),
            label: "Open Security Alert",
            tag: (stats?.openAlerts ?? 0) > 0 ? "Action needed" : "Clear",
            tagClass: (stats?.openAlerts ?? 0) > 0 ? "tt-r" : "tt-g",
          },
        ]}
      />
      {(stats?.openAlerts ?? 0) > 0 && alert ? (
        <div className="panel" style={{ borderColor: "#fecaca" }}>
          <div className="panel-hd" style={{ background: "#fef2f2" }}>
            <h3 style={{ color: "var(--red)" }}>🚨 Open Security Alert</h3>
            <AdminButton
              variant="danger"
              onClick={() =>
                acknowledge.mutate(undefined, {
                  onSuccess: () => showToast("Alert acknowledged"),
                })
              }
            >
              Acknowledge
            </AdminButton>
          </div>
          <div className="panel-bd">
            <div className="tpl-item">
              <div className="tpl-ic" style={{ background: "#fef2f2" }}>
                🔐
              </div>
              <div className="tpl-info">
                <strong>
                  {alert.action}
                  {alert.target ? ` — ${alert.target}` : ""}
                </strong>
                <span>
                  {alert.actorEmail ?? alert.actorName}
                  {alert.ipAddress ? ` · From IP ${alert.ipAddress}` : ""} · {formatRelativeTime(alert.createdAt)}
                </span>
              </div>
              <AdminButton onClick={() => showToast("Opening full event trail for this alert...")}>
                Investigate
              </AdminButton>
            </div>
          </div>
        </div>
      ) : null}
      <FilterPills
        filters={CATEGORY_FILTERS.map((f) => f.label)}
        activeIndex={filterIndex}
        onChange={(index) => {
          setFilterIndex(index);
          setPage(1);
        }}
      />
      <PanelTable
        title="Activity & Audit Log"
        actions={
          <>
            <AdminButton onClick={() => showToast("Exporting filtered log as CSV...")}>⬇ Export</AdminButton>
            <AdminButton onClick={() => showToast("Opening alert rule settings...")}>⚙️ Alert Rules</AdminButton>
          </>
        }
        headers={["Time", "Actor", "Action", "Target", "IP Address", "Result", "Severity", "Details"]}
        rows={rows}
        loading={logsQuery.isLoading}
        pagerInfo={`Showing ${rows.length} of ${logsQuery.data?.meta.total ?? 0} events`}
        page={page}
        totalPages={logsQuery.data?.meta.totalPages ?? 1}
        onPageChange={setPage}
        emptyMessage="No audit events recorded yet"
      />
    </>
  );
}
