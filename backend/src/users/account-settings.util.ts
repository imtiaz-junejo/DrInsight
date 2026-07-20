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
  locale: 'en',
  timezone: 'Asia/Karachi',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readBool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function readString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export function normalizeAccountSettings(raw: unknown): UserAccountSettings {
  if (!isRecord(raw)) {
    return { ...DEFAULT_ACCOUNT_SETTINGS };
  }

  const email = isRecord(raw.emailNotifications) ? raw.emailNotifications : {};
  const push = isRecord(raw.pushNotifications) ? raw.pushNotifications : {};

  return {
    emailNotifications: {
      appointments: readBool(email.appointments, DEFAULT_ACCOUNT_SETTINGS.emailNotifications.appointments),
      messages: readBool(email.messages, DEFAULT_ACCOUNT_SETTINGS.emailNotifications.messages),
      articles: readBool(email.articles, DEFAULT_ACCOUNT_SETTINGS.emailNotifications.articles),
      marketing: readBool(email.marketing, DEFAULT_ACCOUNT_SETTINGS.emailNotifications.marketing),
    },
    pushNotifications: {
      appointments: readBool(push.appointments, DEFAULT_ACCOUNT_SETTINGS.pushNotifications.appointments),
      messages: readBool(push.messages, DEFAULT_ACCOUNT_SETTINGS.pushNotifications.messages),
      reminders: readBool(push.reminders, DEFAULT_ACCOUNT_SETTINGS.pushNotifications.reminders),
    },
    twoFactorEnabled: readBool(raw.twoFactorEnabled, DEFAULT_ACCOUNT_SETTINGS.twoFactorEnabled),
    locale: readString(raw.locale, DEFAULT_ACCOUNT_SETTINGS.locale),
    timezone: readString(raw.timezone, DEFAULT_ACCOUNT_SETTINGS.timezone),
  };
}

export function mergeAccountSettings(
  current: unknown,
  patch: Partial<UserAccountSettings>,
): UserAccountSettings {
  const base = normalizeAccountSettings(current);

  return normalizeAccountSettings({
    ...base,
    ...patch,
    emailNotifications: {
      ...base.emailNotifications,
      ...(patch.emailNotifications ?? {}),
    },
    pushNotifications: {
      ...base.pushNotifications,
      ...(patch.pushNotifications ?? {}),
    },
  });
}
