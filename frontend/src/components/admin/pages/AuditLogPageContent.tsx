"use client";

import {
  AdminButton,
  FilterPills,
  PanelTable,
  StatCardRow,
} from "@/components/admin/ui/AdminPrimitives";
import { useAdminUiStore } from "@/store/admin-ui.store";

// TODO: connect GET /audit-logs when backend endpoint exists
export function AuditLogPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);

  return (
    <>
      <StatCardRow
        items={[
          { ic: "ic1", icon: "📜", num: "0", label: "Events Logged (24h)", tag: "All categories", tagClass: "tt-b" },
          { ic: "ic2", icon: "🛠️", num: "0", label: "Admin Actions (24h)", tag: "No API", tagClass: "tt-b" },
          { ic: "ic3", icon: "🔓", num: "0", label: "Failed Logins (24h)", tag: "Review", tagClass: "tt-a" },
          { ic: "ic4", icon: "🚨", num: "0", label: "Open Security Alert", tag: "No data", tagClass: "tt-r" },
        ]}
      />
      <div className="panel" style={{ borderColor: "#fecaca" }}>
        <div className="panel-hd" style={{ background: "#fef2f2" }}>
          <h3 style={{ color: "var(--red)" }}>🚨 Open Security Alert</h3>
          <AdminButton variant="danger" onClick={() => showToast("Alert acknowledged")}>
            Acknowledge
          </AdminButton>
        </div>
        <div className="panel-bd">
          <div className="tpl-item">
            <div className="tpl-ic" style={{ background: "#fef2f2" }}>
              🔐
            </div>
            <div className="tpl-info">
              <strong>No security alerts — audit log API not available</strong>
              <span>TODO: connect audit log endpoint when available</span>
            </div>
            <AdminButton onClick={() => showToast("Opening full event trail for this alert...")}>Investigate</AdminButton>
          </div>
        </div>
      </div>
      <FilterPills filters={["All Events", "Admin Actions", "Auth & Security", "Data Access", "Payments & Payouts", "Errors"]} />
      <PanelTable
        title="Activity & Audit Log"
        actions={
          <>
            <AdminButton onClick={() => showToast("Exporting filtered log as CSV...")}>⬇ Export</AdminButton>
            <AdminButton onClick={() => showToast("Opening alert rule settings...")}>⚙️ Alert Rules</AdminButton>
          </>
        }
        headers={["Time", "Actor", "Action", "Target", "IP Address", "Result", "Severity", "Details"]}
        rows={[]}
        pagerInfo="Showing 0 of 0 events"
        emptyMessage="No audit events — TODO: connect audit log API"
      />
    </>
  );
}
