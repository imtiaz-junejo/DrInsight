"use client";

import {
  Bell,
  DoctorIcon,
  DoctorIconInline,
  Globe,
  Lock,
  Mail,
  PhysicianDashboardLabel,
  Settings2,
  Shield,
  Trash2,
  type DoctorIconComponent,
} from "@/components/doctor/icons/DoctorIcons";
import { DashCard, DashPageHeader, SettingsRow } from "@/components/doctor/ui/DoctorPrimitives";
import { todayFormatted } from "@/lib/doctor-utils";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

const SETTINGS: Array<{
  icon: DoctorIconComponent;
  title: string;
  description: string;
  action: string;
  danger: boolean;
}> = [
  { icon: Lock, title: "Change Password", description: "Update your account password", action: "Change", danger: false },
  { icon: Mail, title: "Email Notifications", description: "Manage which emails you receive", action: "Manage", danger: false },
  { icon: Bell, title: "Push Notifications", description: "Control in-app alert preferences", action: "Configure", danger: false },
  { icon: Shield, title: "Two-Factor Authentication", description: "Add an extra layer of account security", action: "Enable", danger: false },
  { icon: Globe, title: "Language & Region", description: "Set your preferred language and timezone", action: "Update", danger: false },
  { icon: Trash2, title: "Delete Account", description: "Permanently delete your account and all data", action: "Delete", danger: true },
];

export function SettingsPageContent() {
  const showToast = useDoctorUiStore((s) => s.showToast);

  return (
    <>
      <DashPageHeader subtitle={<PhysicianDashboardLabel />} title="Settings" dateStr={todayFormatted()} />

      <DashCard title={<DoctorIconInline icon={Settings2} size="button">Account Settings</DoctorIconInline>}>
        {SETTINGS.map(({ icon, title, description, action, danger }) => (
          <SettingsRow
            key={title}
            icon={<DoctorIcon icon={icon} size="button" />}
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
