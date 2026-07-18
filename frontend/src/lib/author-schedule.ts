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
