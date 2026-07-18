import type { DoctorProfile, DoctorScheduleDay } from "@/services/api-hooks";

export function asScheduleDays(value: unknown): DoctorScheduleDay[] | null | undefined {
  return Array.isArray(value) ? (value as DoctorScheduleDay[]) : undefined;
}

export type BookingCategory = "physical" | "online" | "";
export type ConsultTypeKey = "video" | "voice" | "phone";

export const CONSULT_TYPE_LABELS: Record<ConsultTypeKey, string> = {
  video: "Video Consultation",
  voice: "Voice Consultation",
  phone: "Chat Consultation",
};

export const CATEGORY_LABELS: Record<Exclude<BookingCategory, "">, string> = {
  physical: "Physical Appointment",
  online: "Online Consultation",
};

export const CONSULTATION_TYPE_MAP: Record<string, "VIDEO" | "AUDIO" | "CHAT" | "IN_PERSON"> = {
  "Video Consultation": "VIDEO",
  "Voice Consultation": "AUDIO",
  "Phone Consultation": "AUDIO",
  "Chat Consultation": "CHAT",
  "Physical Appointment": "IN_PERSON",
};

export const TYPE_ICONS: Record<ConsultTypeKey, string> = {
  video: "ti-video",
  voice: "ti-microphone",
  phone: "ti-message-circle",
};

export const TYPE_SHORT_LABELS: Record<ConsultTypeKey, string> = {
  video: "Video",
  voice: "Voice",
  phone: "Chat",
};

export function getDoctorFees(baseFee: number) {
  return {
    physical: baseFee,
    video: baseFee,
    voice: Math.round(baseFee * 0.75),
    phone: Math.round(baseFee * 0.5),
  };
}

export function doctorSupportsCategory(profile: DoctorProfile, category: BookingCategory): boolean {
  if (!category) return false;
  if (category === "physical") {
    if (profile.clinicSchedule) return true;
    if (profile.services?.some((s) => /in.?person|clinic|physical/i.test(s))) return true;
    return true;
  }
  if (profile.onlineSchedule || (profile.weeklySchedule && profile.weeklySchedule.length > 0)) return true;
  if (profile.services?.some((s) => /video|online|tele|chat/i.test(s))) return true;
  return true;
}

export function doctorOnlineTypes(_profile: DoctorProfile): ConsultTypeKey[] {
  return ["video", "voice", "phone"];
}

export function getSelectedFee(
  fees: ReturnType<typeof getDoctorFees>,
  category: BookingCategory,
  consultTypeKey: ConsultTypeKey | null,
): number {
  if (category === "physical") return fees.physical;
  if (consultTypeKey) return fees[consultTypeKey];
  return fees.video;
}

const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function formatNextAvailableSlot(schedule?: DoctorScheduleDay[] | null): string {
  if (!schedule?.length) return "Check availability";
  const today = new Date();
  for (let offset = 0; offset < 14; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const dayName = WEEKDAY_NAMES[date.getDay()];
    const entry = schedule.find((d) => d.day.toLowerCase() === dayName.toLowerCase() && d.available);
    if (!entry) continue;
    const start = entry.time.replace(/\(.*?\)/g, "").split(/[–-]/)[0]?.trim();
    if (!start) continue;
    const prefix = offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : dayName;
    return `${prefix}, ${start}`;
  }
  return "Check availability";
}

export function resolveConsultTypeLabel(
  category: BookingCategory,
  consultTypeKey: ConsultTypeKey | null,
): string {
  if (category === "physical") return CATEGORY_LABELS.physical;
  if (consultTypeKey) return CONSULT_TYPE_LABELS[consultTypeKey];
  return "";
}
