"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  DoctorIcon,
  DoctorIconInline,
  Globe,
  Lock,
  Mail,
  Settings2,
  Shield,
  Trash2,
  type DoctorIconComponent,
} from "@/components/doctor/icons/DoctorIcons";
import { ConsModal, ConsModalButton } from "@/components/doctor/ui/ConsModal";
import { DashCard, DashPageHeader, SettingsRow } from "@/components/doctor/ui/DoctorPrimitives";
import {
  DEFAULT_ACCOUNT_SETTINGS,
  LOCALE_OPTIONS,
  TIMEZONE_OPTIONS,
  type SettingsPanelKey,
  type UserAccountSettings,
} from "@/lib/account-settings";
import { todayFormatted } from "@/lib/doctor-utils";
import {
  useAccountSettings,
  useChangePassword,
  useDeleteAccount,
  useUpdateAccountSettings,
} from "@/services/account-settings-api-hooks";
import { useAuthStore } from "@/store/auth.store";

type SettingRowConfig = {
  key: SettingsPanelKey;
  icon: DoctorIconComponent;
  title: string;
  description: string;
  danger?: boolean;
};

const SETTING_ROWS: SettingRowConfig[] = [
  {
    key: "password",
    icon: Lock,
    title: "Change Password",
    description: "Update your account password",
  },
  {
    key: "email",
    icon: Mail,
    title: "Email Notifications",
    description: "Manage which emails you receive",
  },
  {
    key: "push",
    icon: Bell,
    title: "Push Notifications",
    description: "Control in-app alert preferences",
  },
  {
    key: "twoFactor",
    icon: Shield,
    title: "Two-Factor Authentication",
    description: "Add an extra layer of account security",
  },
  {
    key: "locale",
    icon: Globe,
    title: "Language & Region",
    description: "Set your preferred language and timezone",
  },
  {
    key: "delete",
    icon: Trash2,
    title: "Delete Account",
    description: "Permanently delete your account and all data",
    danger: true,
  },
];

function PreferenceToggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="dp-settings-toggle">
      <div>
        <div className="dp-settings-toggle-label">{label}</div>
        <div className="dp-settings-toggle-desc">{description}</div>
      </div>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

function SettingsField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="dp-form-field">
      <span>{label}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function extractErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { data?: { message?: string | string[] } } }).response;
    const message = response?.data?.message;
    if (Array.isArray(message)) return message[0] ?? fallback;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

export function AccountSettingsExperience({
  subtitle,
  showToast,
}: {
  subtitle: ReactNode;
  showToast: (message: string) => void;
}) {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const settingsQuery = useAccountSettings();
  const updateSettings = useUpdateAccountSettings();
  const changePassword = useChangePassword();
  const deleteAccount = useDeleteAccount();

  const [activePanel, setActivePanel] = useState<SettingsPanelKey | null>(null);
  const [settingsDraft, setSettingsDraft] = useState<UserAccountSettings>(DEFAULT_ACCOUNT_SETTINGS);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const settings = settingsQuery.data ?? DEFAULT_ACCOUNT_SETTINGS;

  useEffect(() => {
    if (settingsQuery.data) {
      setSettingsDraft(settingsQuery.data);
    }
  }, [settingsQuery.data]);

  const closePanel = () => {
    setActivePanel(null);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setDeletePassword("");
    setDeleteConfirmation("");
    if (settingsQuery.data) {
      setSettingsDraft(settingsQuery.data);
    }
  };

  const actionLabel = useMemo(() => {
    const map: Record<SettingsPanelKey, string> = {
      password: "Change",
      email: "Manage",
      push: "Configure",
      twoFactor: settings.twoFactorEnabled ? "Manage" : "Enable",
      locale: "Update",
      delete: "Delete",
    };
    return (key: SettingsPanelKey) => map[key];
  }, [settings.twoFactorEnabled]);

  const localeSummary = useMemo(() => {
    const localeLabel = LOCALE_OPTIONS.find((item) => item.value === settings.locale)?.label ?? settings.locale;
    const timezoneLabel =
      TIMEZONE_OPTIONS.find((item) => item.value === settings.timezone)?.label ?? settings.timezone;
    return `${localeLabel} · ${timezoneLabel}`;
  }, [settings.locale, settings.timezone]);

  const saveSettings = async (patch: Partial<UserAccountSettings>, successMessage: string) => {
    try {
      await updateSettings.mutateAsync(patch);
      showToast(successMessage);
      closePanel();
    } catch (error) {
      showToast(extractErrorMessage(error, "Could not save settings. Please try again."));
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match.");
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      showToast("Password updated successfully. Please sign in again.");
      clearAuth();
      router.push("/login");
    } catch (error) {
      showToast(extractErrorMessage(error, "Could not update password."));
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword || !deleteConfirmation) {
      showToast("Enter your password and type DELETE to confirm.");
      return;
    }

    try {
      await deleteAccount.mutateAsync({
        password: deletePassword,
        confirmation: deleteConfirmation,
      });
      showToast("Your account has been deleted.");
      clearAuth();
      router.push("/");
    } catch (error) {
      showToast(extractErrorMessage(error, "Could not delete account."));
    }
  };

  return (
    <>
      <DashPageHeader subtitle={subtitle} title="Settings" dateStr={todayFormatted()} />

      <DashCard title={<DoctorIconInline icon={Settings2} size="button">Account Settings</DoctorIconInline>}>
        {settingsQuery.isLoading ? (
          <p style={{ color: "var(--gray-400)", fontSize: "0.85rem" }}>Loading settings...</p>
        ) : (
          SETTING_ROWS.map(({ key, icon, title, description, danger }) => (
            <SettingsRow
              key={key}
              icon={<DoctorIcon icon={icon} size="button" />}
              title={title}
              description={
                key === "locale"
                  ? `${description} · Current: ${localeSummary}`
                  : key === "twoFactor" && settings.twoFactorEnabled
                    ? `${description} · Enabled`
                    : description
              }
              actionLabel={actionLabel(key)}
              danger={danger}
              onAction={() => setActivePanel(key)}
            />
          ))
        )}
      </DashCard>

      <ConsModal
        open={activePanel === "password"}
        icon="🔒"
        title="Change Password"
        onClose={closePanel}
        footer={
          <>
            <ConsModalButton variant="ghost" onClick={closePanel}>
              Cancel
            </ConsModalButton>
            <ConsModalButton
              variant="blue"
              onClick={handleChangePassword}
              disabled={changePassword.isPending}
            >
              {changePassword.isPending ? "Saving..." : "Update Password"}
            </ConsModalButton>
          </>
        }
      >
        <p className="dp-settings-modal-copy">
          Choose a strong password with at least 8 characters, including uppercase, number, and special character.
        </p>
        <SettingsField
          label="Current Password"
          type="password"
          value={currentPassword}
          onChange={setCurrentPassword}
        />
        <SettingsField label="New Password" type="password" value={newPassword} onChange={setNewPassword} />
        <SettingsField
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />
      </ConsModal>

      <ConsModal
        open={activePanel === "email"}
        icon="📧"
        title="Email Notifications"
        onClose={closePanel}
        footer={
          <>
            <ConsModalButton variant="ghost" onClick={closePanel}>
              Cancel
            </ConsModalButton>
            <ConsModalButton
              variant="blue"
              onClick={() =>
                saveSettings({ emailNotifications: settingsDraft.emailNotifications }, "Email preferences saved")
              }
              disabled={updateSettings.isPending}
            >
              {updateSettings.isPending ? "Saving..." : "Save Preferences"}
            </ConsModalButton>
          </>
        }
      >
        <div className="dp-settings-toggle-list">
          <PreferenceToggle
            label="Appointments & consultations"
            description="Booking confirmations, reminders, and schedule changes"
            checked={settingsDraft.emailNotifications.appointments}
            onChange={(appointments) =>
              setSettingsDraft((prev) => ({
                ...prev,
                emailNotifications: { ...prev.emailNotifications, appointments },
              }))
            }
          />
          <PreferenceToggle
            label="Messages & patient updates"
            description="Direct messages, Q&A responses, and clinical updates"
            checked={settingsDraft.emailNotifications.messages}
            onChange={(messages) =>
              setSettingsDraft((prev) => ({
                ...prev,
                emailNotifications: { ...prev.emailNotifications, messages },
              }))
            }
          />
          <PreferenceToggle
            label="Articles & publications"
            description="Editorial updates, review outcomes, and content alerts"
            checked={settingsDraft.emailNotifications.articles}
            onChange={(articles) =>
              setSettingsDraft((prev) => ({
                ...prev,
                emailNotifications: { ...prev.emailNotifications, articles },
              }))
            }
          />
          <PreferenceToggle
            label="Platform news & marketing"
            description="Product updates, surveys, and promotional emails"
            checked={settingsDraft.emailNotifications.marketing}
            onChange={(marketing) =>
              setSettingsDraft((prev) => ({
                ...prev,
                emailNotifications: { ...prev.emailNotifications, marketing },
              }))
            }
          />
        </div>
      </ConsModal>

      <ConsModal
        open={activePanel === "push"}
        icon="🔔"
        title="Push Notifications"
        onClose={closePanel}
        footer={
          <>
            <ConsModalButton variant="ghost" onClick={closePanel}>
              Cancel
            </ConsModalButton>
            <ConsModalButton
              variant="blue"
              onClick={() =>
                saveSettings({ pushNotifications: settingsDraft.pushNotifications }, "Notification preferences saved")
              }
              disabled={updateSettings.isPending}
            >
              {updateSettings.isPending ? "Saving..." : "Save Preferences"}
            </ConsModalButton>
          </>
        }
      >
        <div className="dp-settings-toggle-list">
          <PreferenceToggle
            label="Appointments"
            description="Live alerts for new bookings, cancellations, and start times"
            checked={settingsDraft.pushNotifications.appointments}
            onChange={(appointments) =>
              setSettingsDraft((prev) => ({
                ...prev,
                pushNotifications: { ...prev.pushNotifications, appointments },
              }))
            }
          />
          <PreferenceToggle
            label="Messages"
            description="Instant alerts for patient messages and Q&A activity"
            checked={settingsDraft.pushNotifications.messages}
            onChange={(messages) =>
              setSettingsDraft((prev) => ({
                ...prev,
                pushNotifications: { ...prev.pushNotifications, messages },
              }))
            }
          />
          <PreferenceToggle
            label="Reminders"
            description="Follow-up reminders and daily schedule summaries"
            checked={settingsDraft.pushNotifications.reminders}
            onChange={(reminders) =>
              setSettingsDraft((prev) => ({
                ...prev,
                pushNotifications: { ...prev.pushNotifications, reminders },
              }))
            }
          />
        </div>
      </ConsModal>

      <ConsModal
        open={activePanel === "twoFactor"}
        icon="🛡️"
        title="Two-Factor Authentication"
        onClose={closePanel}
        footer={
          <>
            <ConsModalButton variant="ghost" onClick={closePanel}>
              Cancel
            </ConsModalButton>
            <ConsModalButton
              variant="blue"
              onClick={() =>
                saveSettings(
                  { twoFactorEnabled: settingsDraft.twoFactorEnabled },
                  settingsDraft.twoFactorEnabled
                    ? "Two-factor authentication enabled"
                    : "Two-factor authentication disabled",
                )
              }
              disabled={updateSettings.isPending}
            >
              {updateSettings.isPending ? "Saving..." : "Save Security Setting"}
            </ConsModalButton>
          </>
        }
      >
        <p className="dp-settings-modal-copy">
          When enabled, DrInsight will require an email verification code when you sign in from a new device or browser.
        </p>
        <PreferenceToggle
          label="Require email verification on new sign-ins"
          description="Adds an extra security step beyond your password"
          checked={settingsDraft.twoFactorEnabled}
          onChange={(twoFactorEnabled) => setSettingsDraft((prev) => ({ ...prev, twoFactorEnabled }))}
        />
      </ConsModal>

      <ConsModal
        open={activePanel === "locale"}
        icon="🌍"
        title="Language & Region"
        onClose={closePanel}
        footer={
          <>
            <ConsModalButton variant="ghost" onClick={closePanel}>
              Cancel
            </ConsModalButton>
            <ConsModalButton
              variant="blue"
              onClick={() =>
                saveSettings(
                  { locale: settingsDraft.locale, timezone: settingsDraft.timezone },
                  "Language and region updated",
                )
              }
              disabled={updateSettings.isPending}
            >
              {updateSettings.isPending ? "Saving..." : "Save Changes"}
            </ConsModalButton>
          </>
        }
      >
        <label className="dp-form-field">
          <span>Language</span>
          <select
            value={settingsDraft.locale}
            onChange={(e) => setSettingsDraft((prev) => ({ ...prev, locale: e.target.value }))}
          >
            {LOCALE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="dp-form-field">
          <span>Timezone</span>
          <select
            value={settingsDraft.timezone}
            onChange={(e) => setSettingsDraft((prev) => ({ ...prev, timezone: e.target.value }))}
          >
            {TIMEZONE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </ConsModal>

      <ConsModal
        open={activePanel === "delete"}
        icon="🗑️"
        title="Delete Account"
        warn
        onClose={closePanel}
        footer={
          <>
            <ConsModalButton variant="ghost" onClick={closePanel}>
              Cancel
            </ConsModalButton>
            <ConsModalButton
              variant="red"
              onClick={handleDeleteAccount}
              disabled={deleteAccount.isPending}
            >
              {deleteAccount.isPending ? "Deleting..." : "Delete Account"}
            </ConsModalButton>
          </>
        }
      >
        <p className="dp-settings-modal-copy">
          This action permanently deactivates your account and signs you out. Type <strong>DELETE</strong> to confirm.
        </p>
        <SettingsField
          label="Password"
          type="password"
          value={deletePassword}
          onChange={setDeletePassword}
        />
        <SettingsField
          label='Confirmation (type "DELETE")'
          value={deleteConfirmation}
          onChange={setDeleteConfirmation}
          placeholder="DELETE"
        />
      </ConsModal>
    </>
  );
}
