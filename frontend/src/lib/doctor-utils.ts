export {
  avatarGradient,
  avatarGradients,
  formatCurrency,
  formatDateTime,
  formatNumber,
  formatRelativeTime,
  getInitials,
  hashString,
  consultationTypeIcon,
} from "@/lib/admin-utils";

export function todayFormatted(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function todayShortFormatted(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const DOCTOR_PREFIX_REGEX = /^dr\.?\s+/i;

/** Removes repeated leading "Dr." / "Dr" prefixes from a name string. */
export function stripDoctorPrefix(value: string): string {
  let result = value.trim();
  while (DOCTOR_PREFIX_REGEX.test(result)) {
    result = result.replace(DOCTOR_PREFIX_REGEX, "").trim();
  }
  return result;
}

/** Joins first/last name parts without storing honorifics in the database fields. */
export function joinDoctorName(firstName?: string | null, lastName?: string | null): string {
  const first = stripDoctorPrefix(firstName ?? "");
  const last = stripDoctorPrefix(lastName ?? "");
  return [first, last].filter(Boolean).join(" ");
}

/** Ensures a display name has exactly one "Dr." prefix. */
export function ensureDoctorPrefix(value: string): string {
  const stripped = stripDoctorPrefix(value);
  return stripped ? `Dr. ${stripped}` : "";
}

export function doctorDisplayName(firstName?: string | null, lastName?: string | null): string {
  const name = joinDoctorName(firstName, lastName);
  return name ? ensureDoctorPrefix(name) : "Doctor";
}

export function patientStatusLabel(status: string): { label: string; color: string } {
  const map: Record<string, [string, string]> = {
    Critical: ["🔴 Critical", "var(--red)"],
    Active: ["🟢 Active", "var(--green)"],
    "Follow-up": ["🟡 Follow-up", "#d97706"],
    New: ["🔵 New", "var(--blue)"],
  };
  const [label, color] = map[status] ?? ["Unknown", "var(--gray-600)"];
  return { label, color };
}
