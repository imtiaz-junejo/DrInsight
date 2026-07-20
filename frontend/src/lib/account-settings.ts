export type EmailNotificationSettings = {
  appointments: boolean;
  messages: boolean;
  articles: boolean;
  marketing: boolean;
};

export type PushNotificationSettings = {
  appointments: boolean;
  messages: boolean;
  reminders: boolean;
};

export type UserAccountSettings = {
  emailNotifications: EmailNotificationSettings;
  pushNotifications: PushNotificationSettings;
  twoFactorEnabled: boolean;
  locale: string;
  timezone: string;
};

export const DEFAULT_ACCOUNT_SETTINGS: UserAccountSettings = {
  emailNotifications: {
    appointments: true,
    messages: true,
    articles: true,
    marketing: false,
  },
  pushNotifications: {
    appointments: true,
    messages: true,
    reminders: true,
  },
  twoFactorEnabled: false,
  locale: "en",
  timezone: "Asia/Karachi",
};

export const LOCALE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "ur", label: "Urdu" },
] as const;

export const TIMEZONE_OPTIONS = [
  { value: "Asia/Karachi", label: "Pakistan (PKT — Asia/Karachi)" },
  { value: "Asia/Dubai", label: "UAE (GST — Asia/Dubai)" },
  { value: "Asia/Kolkata", label: "India (IST — Asia/Kolkata)" },
  { value: "Europe/London", label: "United Kingdom (GMT — Europe/London)" },
  { value: "America/New_York", label: "US Eastern (America/New_York)" },
  { value: "UTC", label: "UTC" },
] as const;

export type SettingsPanelKey =
  | "password"
  | "email"
  | "push"
  | "twoFactor"
  | "locale"
  | "delete";
