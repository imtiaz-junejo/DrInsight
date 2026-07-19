import type { Appointment } from "@/services/api-hooks.types";
import type { ClinicScheduleConfig } from "@/services/doctor-api-hooks";

export function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function todayInput(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Generates bookable time slots (as HH:mm) from the clinic schedule, skipping the break window. */
export function slotTimes(schedule: ClinicScheduleConfig | null | undefined, dateStr: string): string[] {
  if (dateStr && schedule?.days) {
    const dayKey = new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", { weekday: "short" });
    if (schedule.days[dayKey] === false) return [];
    const holiday = schedule.holidays?.some((h) => h.date === dateStr);
    if (holiday) return [];
  }
  const start = schedule?.start ?? "09:00";
  const end = schedule?.end ?? "17:00";
  const breakStart = schedule?.breakStart ?? "13:00";
  const breakEnd = schedule?.breakEnd ?? "14:00";
  const step = schedule?.slotMinutes ?? 30;

  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const out: string[] = [];
  let cur = toMin(start);
  const endMin = toMin(end);
  const b1 = toMin(breakStart);
  const b2 = toMin(breakEnd);
  while (cur + step <= endMin && out.length < 60) {
    if (!(cur >= b1 && cur < b2)) out.push(`${pad(Math.floor(cur / 60))}:${pad(cur % 60)}`);
    cur += step;
  }
  return out;
}

export function slotLabel(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  const hh = h % 12 || 12;
  return `${hh}:${pad(m)} ${ap}`;
}

export function apptTime(appt: Appointment): string {
  return new Date(appt.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function patientName(appt: Appointment): string {
  return `${appt.patient?.user?.firstName ?? ""} ${appt.patient?.user?.lastName ?? ""}`.trim() || "Patient";
}

export function normSearchValue(value: string): string {
  return value.replace(/[\s\-+()]/g, "").toLowerCase();
}

export function sourceLabel(source?: string): string {
  switch (source) {
    case "PHONE":
      return "Phone";
    case "CLINIC_VISIT":
      return "Clinic visit";
    case "EMERGENCY":
      return "Emergency";
    default:
      return "Walk-in";
  }
}

export function patientAge(dob?: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}
