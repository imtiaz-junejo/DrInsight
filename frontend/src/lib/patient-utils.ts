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

export function patientDisplayName(firstName?: string | null, lastName?: string | null): string {
  const name = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return name || "Sarah Johnson";
}
