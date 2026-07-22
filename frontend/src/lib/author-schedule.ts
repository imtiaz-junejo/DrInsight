export type DayScheduleConfig = {
  days?: Record<string, boolean>;
  start?: string;
  end?: string;
  slotMinutes?: number;
  breakStart?: string;
  breakEnd?: string;
  holidays?: Array<{ date: string; label?: string }>;
  types?: {
    video?: { on?: boolean; fee?: number };
    audio?: { on?: boolean; fee?: number };
    chat?: { on?: boolean; fee?: number };
  };
};

export const DEFAULT_ONLINE_SCHEDULE: DayScheduleConfig = {
  days: { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false },
  start: "10:00",
  end: "18:00",
  slotMinutes: 30,
  breakStart: "13:30",
  breakEnd: "14:30",
  holidays: [],
};

export const DEFAULT_CLINIC_SCHEDULE: DayScheduleConfig = {
  days: { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true, Sun: false },
  start: "09:00",
  end: "17:00",
  slotMinutes: 30,
  breakStart: "13:00",
  breakEnd: "14:00",
  holidays: [],
};

export function mergeScheduleConfig(
  defaults: DayScheduleConfig,
  config?: DayScheduleConfig | null,
): DayScheduleConfig {
  if (!config) return defaults;
  return {
    ...defaults,
    ...config,
    days: { ...defaults.days, ...config.days },
    holidays: config.holidays ?? defaults.holidays,
    types: config.types ? { ...defaults.types, ...config.types } : defaults.types,
  };
}

const DAY_LABELS: Array<[string, string]> = [
  ["Mon", "Monday"],
  ["Tue", "Tuesday"],
  ["Wed", "Wednesday"],
  ["Thu", "Thursday"],
  ["Fri", "Friday"],
  ["Sat", "Saturday"],
  ["Sun", "Sunday"],
];

export function formatScheduleTime(time?: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time ?? "");
  if (!match) return time ?? "";
  const hour = Number(match[1]);
  const minutes = match[2];
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${period}`;
}

export function buildAvailabilityRows(config?: DayScheduleConfig | null) {
  if (!config?.days) return [];
  return DAY_LABELS.map(([key, label]) => {
    const available = Boolean(config.days?.[key]);
    return {
      day: label,
      available,
      time: available
        ? `${formatScheduleTime(config.start)} – ${formatScheduleTime(config.end)}`
        : "Not Available",
    };
  });
}

export function buildAvailabilityFooter(config?: DayScheduleConfig | null): string[] {
  const slot = config?.slotMinutes ?? 30;
  const lines: string[] = [];
  let summary = `⏱️ ${slot}-minute slots`;
  if (config?.breakStart && config?.breakEnd) {
    summary += ` · ☕ Break ${formatScheduleTime(config.breakStart)}–${formatScheduleTime(config.breakEnd)}`;
  }
  const holidayCount = config?.holidays?.length ?? 0;
  if (holidayCount > 0) {
    summary += ` · 🚫 ${holidayCount} unavailable date${holidayCount > 1 ? "s" : ""}`;
  }
  lines.push(summary);
  return lines;
}

export function buildConsultationTypes(config?: DayScheduleConfig | null, fallbackFee = 0) {
  const types = config?.types;
  const slot = config?.slotMinutes ?? 30;
  const items: Array<{ icon: string; label: string; hint: string; price: number | null }> = [];

  if (types?.video?.on !== false) {
    items.push({
      icon: "📹",
      label: "Video Consultation",
      hint: `${slot} minutes · HD Video Call`,
      price: types?.video?.fee ?? fallbackFee,
    });
  }
  if (types?.audio?.on !== false) {
    items.push({
      icon: "📞",
      label: "Phone Consultation",
      hint: `${slot} minutes · Voice Call`,
      price: types?.audio?.fee ?? Math.round(fallbackFee * 0.75),
    });
  }
  if (types?.chat?.on !== false) {
    items.push({
      icon: "💬",
      label: "Chat Consultation",
      hint: "Async · 24h response",
      price: types?.chat?.fee ?? Math.round(fallbackFee * 0.5),
    });
  }

  return items;
}
