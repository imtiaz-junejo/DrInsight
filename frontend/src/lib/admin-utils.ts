export const avatarGradients = [
  "linear-gradient(135deg,#1a56a0,#0891b2)",
  "linear-gradient(135deg,#7c3aed,#a78bfa)",
  "linear-gradient(135deg,#059669,#34d399)",
  "linear-gradient(135deg,#dc2626,#f87171)",
  "linear-gradient(135deg,#d97706,#fbbf24)",
  "linear-gradient(135deg,#db2777,#f472b6)",
];

export function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.charAt(0)?.toUpperCase() ?? "";
  const last = lastName?.charAt(0)?.toUpperCase() ?? "";
  return `${first}${last}` || "??";
}

export function avatarGradient(index: number): string {
  return avatarGradients[index % avatarGradients.length];
}

export function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatSharePercent(part: number, total: number): string {
  if (total <= 0) return "0%";
  return `${Math.round((part / total) * 1000) / 10}%`;
}

export function formatSignedChange(value: number, suffix = ""): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value}${suffix}`;
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    cents / 100,
  );
}

export function formatRelativeTime(date: string | Date): string {
  const target = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - target.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return target.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(date: string | Date): string {
  const target = typeof date === "string" ? new Date(date) : date;
  return target.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function consultationTypeIcon(type: string): string {
  if (type === "VIDEO") return "📹 Video";
  if (type === "AUDIO") return "📞 Phone";
  if (type === "CHAT") return "💬 Chat";
  if (type === "IN_PERSON") return "🏥 In Person";
  return type;
}

export function userRoleChip(role: string, status?: string): { label: string; className: string } {
  if (role === "DOCTOR" && status === "PENDING") {
    return { label: "Doctor (Pending)", className: "ch-p" };
  }
  if (role === "DOCTOR") return { label: "Doctor", className: "ch-p" };
  if (role === "ADMIN") return { label: "Super Admin", className: "ch-gray" };
  return { label: "Patient", className: "ch-b" };
}

export function userStatusChip(status: string): { label: string; className: string } {
  if (status === "ACTIVE") return { label: "Active", className: "ch-g" };
  if (status === "PENDING") return { label: "Pending Verification", className: "ch-a" };
  if (status === "SUSPENDED") return { label: "Suspended", className: "ch-r" };
  return { label: status, className: "ch-gray" };
}

export function appointmentStatusChip(status: string): { label: string; className: string } {
  if (status === "IN_PROGRESS") return { label: "🔴 Live", className: "ch-r" };
  if (status === "CONFIRMED") return { label: "Upcoming", className: "ch-b" };
  if (status === "COMPLETED") return { label: "Completed", className: "ch-g" };
  if (status === "CANCELLED") return { label: "Cancelled", className: "ch-r" };
  if (status === "PENDING") return { label: "Pending", className: "ch-a" };
  return { label: status, className: "ch-gray" };
}

export function blogStatusChip(status: string): { label: string; className: string } {
  if (status === "PUBLISHED") return { label: "Published", className: "ch-g" };
  if (status === "DRAFT") return { label: "Draft", className: "ch-gray" };
  if (status === "ARCHIVED") return { label: "Unpublished", className: "ch-r" };
  return { label: status, className: "ch-a" };
}
