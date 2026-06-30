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

export function doctorDisplayName(firstName?: string | null, lastName?: string | null): string {
  const name = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return name ? `Dr. ${name}` : "Doctor";
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
