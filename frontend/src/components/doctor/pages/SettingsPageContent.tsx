"use client";

import { DashCard, DashPageHeader, SettingsRow } from "@/components/doctor/ui/DoctorPrimitives";
import { todayFormatted } from "@/lib/doctor-utils";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

const SETTINGS = [
  ["🔒", "Change Password", "Update your account password", "Change", false],
  ["📧", "Email Notifications", "Manage which emails you receive", "Manage", false],
  ["🔔", "Push Notifications", "Control in-app alert preferences", "Configure", false],
  ["🛡️", "Two-Factor Authentication", "Add an extra layer of account security", "Enable", false],
  ["🌍", "Language & Region", "Set your preferred language and timezone", "Update", false],
  ["🗑️", "Delete Account", "Permanently delete your account and all data", "Delete", true],
] as const;

export function SettingsPageContent() {
  const showToast = useDoctorUiStore((s) => s.showToast);

  return (
    <>
      <DashPageHeader subtitle="👨‍⚕️ Physician Dashboard" title="Settings" dateStr={todayFormatted()} />

      <DashCard title="⚙️ Account Settings">
        {SETTINGS.map(([icon, title, description, action, danger]) => (
          <SettingsRow
            key={title}
            icon={icon}
            title={title}
            description={description}
            actionLabel={action}
            danger={danger}
            onAction={() => showToast(`Opening ${title.toLowerCase()}...`)}
          />
        ))}
      </DashCard>
    </>
  );
}
