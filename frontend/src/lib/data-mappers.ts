import type { Appointment, BlogPost, DoctorProfile } from "@/services/api-hooks";

const GRADIENTS = [
  "linear-gradient(135deg,#0f3d7a,#1a56a0)",
  "linear-gradient(135deg,#dc2626,#f59e0b)",
  "linear-gradient(135deg,#7c3aed,#4a90d9)",
  "linear-gradient(135deg,#059669,#0891b2)",
  "linear-gradient(135deg,#db2777,#f59e0b)",
  "linear-gradient(135deg,#d97706,#059669)",
  "linear-gradient(135deg,#475569,#0891b2)",
  "linear-gradient(135deg,#be185d,#ec4899)",
];

const SPECIALTY_EMOJI: Record<string, string> = {
  Cardiology: "❤️",
  Neurology: "🧠",
  Endocrinology: "🩸",
  Psychiatry: "🧘",
  "Mental Health": "🧘",
  Gynecology: "🤰",
  "Women's Health": "🤰",
  Diabetes: "🩸",
  ENT: "👂",
  Pediatrics: "👶",
  Orthopedics: "🦴",
  Dermatology: "✨",
  "Skin Care": "🧴",
  "Internal Medicine": "🩺",
  Pulmonology: "🫁",
  Oncology: "🧬",
  Gastroenterology: "🔬",
  "General Medicine": "💊",
  "General Health": "🏥",
  "Dental Care": "🦷",
  Fitness: "🏃",
  "Men's Health": "👨‍⚕️",
};

export function getInitials(firstName?: string, lastName?: string): string {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "DR";
}

export function doctorFullName(user?: { firstName?: string; lastName?: string } | null): string {
  if (!user) return "Doctor";
  return `Dr. ${user.firstName} ${user.lastName}`;
}

export function gradientForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % GRADIENTS.length;
  return GRADIENTS[hash];
}

export function specialtyEmoji(specialty: string): string {
  for (const [key, emoji] of Object.entries(SPECIALTY_EMOJI)) {
    if (specialty.toLowerCase().includes(key.toLowerCase())) return emoji;
  }
  return "🩺";
}

export function formatCurrency(amount: number | string, currency = "PKR"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (currency === "usd" || currency === "USD") {
    return `$${num.toLocaleString()}`;
  }
  return `Rs. ${num.toLocaleString()}`;
}

export function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(dateStr).toLocaleDateString("en-US", options ?? {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

export function formatStatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M+`;
  if (n >= 1000) return `${Math.floor(n / 1000)}K+`;
  return `${n}+`;
}

export function consultationTypeLabel(type: string): string {
  const map: Record<string, string> = {
    VIDEO: "📹 Video Call",
    AUDIO: "📞 Phone Call",
    CHAT: "💬 Chat",
    IN_PERSON: "🏥 In Person",
  };
  return map[type] ?? type;
}

export function appointmentStatusChip(status: string): { chip: string; chipLabel: string; cardClass: string } {
  const map: Record<string, { chip: string; chipLabel: string; cardClass: string }> = {
    CONFIRMED: { chip: "cc-up", chipLabel: "📅 Upcoming", cardClass: "upcoming" },
    PENDING: { chip: "cc-pend", chipLabel: "⏳ Pending", cardClass: "upcoming" },
    IN_PROGRESS: { chip: "cc-live", chipLabel: "🔴 Live", cardClass: "upcoming" },
    COMPLETED: { chip: "cc-done", chipLabel: "✓ Completed", cardClass: "completed" },
    CANCELLED: { chip: "cc-cancel", chipLabel: "✕ Cancelled", cardClass: "cancelled" },
  };
  return map[status] ?? { chip: "cc-up", chipLabel: status, cardClass: "upcoming" };
}

export interface MappedConsultation {
  id: string;
  initials: string;
  avatarBg: string;
  doctorName: string;
  specialty: string;
  chip: string;
  chipLabel: string;
  cardClass: string;
  details: string[];
  note: string;
  noteHtml: string;
  canJoin?: boolean;
  noteGreen?: boolean;
  showReview?: boolean;
}

export function mapAppointmentToConsultation(appt: Appointment, perspective: "patient" | "doctor" = "patient"): MappedConsultation {
  const isDoctorView = perspective === "doctor";
  const person = isDoctorView ? appt.patient?.user : appt.doctor?.user;
  const specialty = isDoctorView
    ? appt.reason ?? "Consultation"
    : `${specialtyEmoji(appt.doctor?.specialty ?? "")} ${appt.doctor?.specialty ?? "General"} · ${appt.doctor?.subSpecialty ?? "Board Certified"}`;

  const name = isDoctorView
    ? `${person?.firstName ?? ""} ${person?.lastName ?? ""}`.trim()
    : doctorFullName(appt.doctor?.user);

  const statusInfo = appointmentStatusChip(appt.status);
  const isPast = ["COMPLETED", "CANCELLED"].includes(appt.status);
  const isOnline = ["VIDEO", "AUDIO", "CHAT"].includes(appt.consultationType);
  const meetingLive = appt.meetingStatus === "LIVE" || appt.status === "IN_PROGRESS";
  const canJoin = !isPast && isOnline && meetingLive;

  return {
    id: appt.id,
    initials: getInitials(person?.firstName, person?.lastName),
    avatarBg: gradientForId(appt.id),
    doctorName: name,
    specialty,
    ...statusInfo,
    details: [
      consultationTypeLabel(appt.consultationType),
      `📅 ${formatDate(appt.scheduledAt)}`,
      `⏱️ ${appt.durationMinutes} min`,
    ],
    note: appt.reason ? `📋 **Reason:** ${appt.reason}` : "",
    noteHtml: appt.reason ? `📋 <strong>Reason:</strong> ${appt.reason}` : "",
    canJoin,
    noteGreen: isPast && appt.status === "COMPLETED",
    showReview: isPast && appt.status === "COMPLETED",
  };
}

export interface MappedDoctorCard {
  id: string;
  profileSlug?: string | null;
  init: string;
  name: string;
  spec: string;
  specialtyName: string;
  specLabel: string;
  cred: string;
  inst: string;
  city: string;
  country: string;
  countryKey: string;
  countryLabel: string;
  exp: number;
  rating: number;
  reviews: number;
  articles: number;
  online: boolean;
  available: boolean;
  verified: boolean;
  avatarUrl?: string | null;
  languages: string[];
  bg: string;
  tags: string[];
  fee: number;
  weeklySchedule?: DoctorProfile["weeklySchedule"];
}

export function mapDoctorProfile(d: DoctorProfile): MappedDoctorCard {
  const emoji = specialtyEmoji(d.specialty);
  const country = d.country ?? "Pakistan";
  const city = d.city ?? "";
  const countryKey = country.toLowerCase();
  return {
    id: d.id,
    profileSlug: d.profileSlug,
    init: getInitials(d.user?.firstName, d.user?.lastName),
    name: doctorFullName(d.user),
    spec: d.specialty.toLowerCase(),
    specialtyName: d.specialty,
    specLabel: `${emoji} ${d.specialty}${d.subSpecialty ? ` · ${d.subSpecialty}` : ""}`,
    cred: d.credentials ?? d.education ?? d.professionalTitle ?? "Board Certified",
    inst: d.hospital ?? "Private Practice",
    city,
    country,
    countryKey,
    countryLabel: city ? `📍 ${city}, ${country}` : `📍 ${country}`,
    exp: d.experienceYears,
    rating: d.rating,
    reviews: d.reviewCount,
    articles: d.articleCount ?? d.articleStats?.count ?? 0,
    online: d.user?.isOnline === true || d.availability === "AVAILABLE",
    available: d.availability === "AVAILABLE",
    verified: !!d.credentialsVerifiedAt,
    avatarUrl: d.user?.avatarUrl,
    languages: d.languages ?? [],
    bg: gradientForId(d.id),
    tags: (d.languages?.length ? d.languages : d.expertise ?? []).slice(0, 3),
    fee: typeof d.consultationFee === "string" ? parseFloat(d.consultationFee) : Number(d.consultationFee) || 0,
    weeklySchedule: d.weeklySchedule,
  };
}

export function scheduleChipForStatus(status: string): { chip: string; chipLabel: string; live: boolean } {
  const map: Record<string, { chip: string; chipLabel: string; live: boolean }> = {
    COMPLETED: { chip: "sc-done", chipLabel: "✓ Done", live: false },
    IN_PROGRESS: { chip: "sc-live", chipLabel: "🔴 Live", live: true },
    CONFIRMED: { chip: "sc-up", chipLabel: "Upcoming", live: false },
    PENDING: { chip: "sc-pend", chipLabel: "Pending", live: false },
    CANCELLED: { chip: "sc-done", chipLabel: "✕ Cancelled", live: false },
  };
  return map[status] ?? { chip: "sc-up", chipLabel: status, live: false };
}

export function formatTimeSlot(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function formatMonthShort(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  if (!year || !month) return monthKey;
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-US", { month: "short" });
}

export function earningsToChartData(monthly: Array<{ month: string; amountCents: number }>) {
  if (!monthly.length) return [];
  const max = Math.max(...monthly.map((m) => m.amountCents), 1);
  return monthly.map((m, i) => ({
    label: formatMonthShort(m.month),
    height: Math.max(8, Math.round((m.amountCents / max) * 92)),
    highlight: i === monthly.length - 1,
  }));
}

export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(mins, 1)} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  return formatDate(dateStr);
}

/** e.g. "Answered 2 days ago" for Ask Doctor cards */
export function formatAnsweredAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return "Answered today";
  if (days === 1) return "Answered 1 day ago";
  if (days < 7) return `Answered ${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "Answered 1 week ago";
  if (weeks < 5) return `Answered ${weeks} weeks ago`;
  const months = Math.floor(days / 30);
  if (months <= 1) return "Answered 1 month ago";
  return `Answered ${months} months ago`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function starsDisplay(rating: number): string {
  const rounded = Math.round(rating);
  return "★".repeat(Math.min(rounded, 5)) + "☆".repeat(Math.max(0, 5 - rounded));
}

export function mapBlogPostToCard(post: BlogPost) {
  const author = post.author;
  return {
    slug: post.slug,
    emoji: specialtyEmoji(post.category?.name ?? ""),
    cat: post.category?.name?.toUpperCase() ?? "HEALTH",
    author: doctorFullName(author),
    read: `${post.readTimeMinutes} min read`,
    date: post.publishedAt ? formatDate(post.publishedAt) : "",
    title: post.title,
    excerpt: post.excerpt,
    authorInitials: getInitials(author?.firstName, author?.lastName),
    authorGradient: gradientForId(post.id),
  };
}
