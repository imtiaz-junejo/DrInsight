import type { AuthProfile } from "@/services/patient-api-hooks";

/** Normalize API / DB gender values to booking form select options. */
export function normalizeGenderForForm(value?: string | null): string {
  if (!value) return "";
  const trimmed = value.trim();
  const upper = trimmed.toUpperCase();
  const map: Record<string, string> = {
    MALE: "Male",
    FEMALE: "Female",
    OTHER: "Other",
    "PREFER NOT TO SAY": "Prefer not to say",
    "PREFER_NOT_TO SAY": "Prefer not to say",
  };
  return map[upper] ?? trimmed;
}

/** Convert ISO / DB timestamps to `YYYY-MM-DD` for HTML date inputs (UTC-safe). */
export function toDateInputValue(value?: string | Date | null): string {
  if (!value) return "";
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, "0");
    const d = String(value.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const str = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const parsed = new Date(str);
  if (Number.isNaN(parsed.getTime())) return str.slice(0, 10);
  const y = parsed.getUTCFullYear();
  const m = String(parsed.getUTCMonth() + 1).padStart(2, "0");
  const d = String(parsed.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export interface PatientFormFields {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
}

/** Read patient fields from /auth/me (supports flat or nested patientProfile). */
export function extractPatientFormFields(profile: AuthProfile): PatientFormFields {
  const nested = profile.patientProfile;
  const dateOfBirth = profile.dateOfBirth ?? nested?.dateOfBirth ?? null;
  const gender = profile.gender ?? nested?.gender ?? null;

  return {
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    email: profile.email ?? "",
    phone: profile.phone ?? "",
    dateOfBirth: toDateInputValue(dateOfBirth),
    gender: normalizeGenderForForm(gender),
  };
}
