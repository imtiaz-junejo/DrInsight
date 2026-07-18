"use client";

import { useRef, useState } from "react";
import {
  AdminButton,
  AdminPanel,
  FormGrid,
  FormItem,
  ToggleSwitch,
} from "@/components/admin/ui/AdminPrimitives";
import { downloadTextFile } from "@/components/admin/site-management/seo-settings-utils";
import { useAuthStore } from "@/store/auth.store";
import { useAdminUiStore } from "@/store/admin-ui.store";
import {
  useChangeAdminPassword,
  useExportConfigurationBackup,
  useRestoreConfigurationBackup,
  useSecuritySettings,
  useUpdateSecuritySettings,
} from "@/services/configuration-api-hooks";
import { useAuditLogs } from "@/services/cms-api-hooks";

function formatAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function BackupSecurityPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const user = useAuthStore((s) => s.user);
  const fileRef = useRef<HTMLInputElement>(null);

  const securityQuery = useSecuritySettings();
  const updateSecurity = useUpdateSecuritySettings();
  const exportBackup = useExportConfigurationBackup();
  const restoreBackup = useRestoreConfigurationBackup();
  const changePassword = useChangeAdminPassword();
  const auditQuery = useAuditLogs({ page: 1, limit: 15 });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleExport = () => {
    exportBackup.mutate(undefined, {
      onSuccess: (data) => {
        downloadTextFile(
          `drinsight-backup-${new Date().toISOString().slice(0, 10)}.json`,
          JSON.stringify(data, null, 2),
          "application/json",
        );
        showToast("✅ Backup downloaded");
      },
      onError: () => showToast("⚠️ Export failed"),
    });
  };

  const handleRestore = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result)) as Record<string, unknown>;
        restoreBackup.mutate(payload, {
          onSuccess: () => showToast("✅ Backup restored"),
          onError: () => showToast("⚠️ Invalid backup file"),
        });
      } catch {
        showToast("⚠️ Invalid backup file");
      }
    };
    reader.readAsText(file);
  };

  const handleChangePassword = () => {
    if (!newPassword) {
      showToast("⚠️ Enter a new password");
      return;
    }
    changePassword.mutate(
      { newPassword, confirmPassword },
      {
        onSuccess: () => {
          setNewPassword("");
          setConfirmPassword("");
          showToast("✅ Password updated");
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            "Failed to update password";
          showToast(`⚠️ ${msg}`);
        },
      },
    );
  };

  const activities = auditQuery.data?.data ?? [];

  return (
    <>
      <AdminPanel title="🗄 Database Backup" bodyClassName="panel-bd">
        <p className="seo-hint" style={{ marginBottom: 12 }}>
          Export everything managed by this panel (SEO, branding, menus, contact, subscribers, ads,
          settings) as a JSON file, or restore from one.
        </p>
        <div className="btn-row">
          <AdminButton variant="primary" onClick={handleExport}>
            ⬇ Download Backup
          </AdminButton>
          <AdminButton onClick={() => fileRef.current?.click()}>⬆ Restore Backup</AdminButton>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            onChange={(e) => handleRestore(e.target.files?.[0])}
          />
        </div>
      </AdminPanel>

      <AdminPanel
        title="🔑 Change Panel Credentials"
        actions={
          <AdminButton variant="primary" onClick={handleChangePassword}>
            Update Credentials
          </AdminButton>
        }
        bodyClassName="panel-bd"
      >
        <FormGrid>
          <FormItem label="Panel Username">
            <input value={user?.email ?? ""} readOnly disabled />
          </FormItem>
          <FormItem label="New Password (min 8 chars)">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </FormItem>
          <FormItem label="Confirm New Password" full>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </FormItem>
        </FormGrid>
      </AdminPanel>

      <AdminPanel title="🛡 Two-Factor Authentication" bodyClassName="panel-bd">
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: ".82rem",
            cursor: "pointer",
          }}
        >
          <ToggleSwitch
            checked={securityQuery.data?.requireTwoFactor ?? false}
            onChange={(checked) =>
              updateSecurity.mutate(
                { requireTwoFactor: checked },
                { onSuccess: () => showToast(checked ? "2FA enabled" : "2FA disabled") },
              )
            }
          />
          Require a second factor at login{" "}
          <span style={{ fontSize: ".72rem", color: "var(--gray-400)" }}>
            (preference recorded; enforcement needs your backend)
          </span>
        </label>
      </AdminPanel>

      <AdminPanel title="📋 Activity Log" bodyClassName="panel-bd">
        {activities.length ? (
          activities.map((a) => (
            <div
              key={a.id}
              style={{
                fontSize: ".78rem",
                color: "var(--gray-600)",
                padding: "6px 0",
                borderBottom: "1px solid var(--gray-100)",
              }}
            >
              {a.action}
              {a.target ? ` — ${a.target}` : ""}
              <span style={{ float: "right", color: "var(--gray-400)" }}>
                {formatAgo(a.createdAt)}
              </span>
            </div>
          ))
        ) : (
          <div
            style={{
              fontSize: ".8rem",
              color: "var(--gray-400)",
              textAlign: "center",
              padding: 14,
            }}
          >
            No activity recorded yet.
          </div>
        )}
      </AdminPanel>
    </>
  );
}
