import type { DoctorDashboardCounts } from "@/services/doctor-api-hooks";

export type DoctorBadgeKey = keyof DoctorDashboardCounts | "articles";

export interface DoctorNavItem {
  id: string;
  ico: string;
  name: string;
  badgeKey?: DoctorBadgeKey;
  badgeClass?: string;
  href: string;
}

export interface DoctorNavGroup {
  lbl: string;
  items: DoctorNavItem[];
}

export const doctorNav: DoctorNavGroup[] = [
  {
    lbl: "Physician Panel",
    items: [
      { id: "dashboard", ico: "📊", name: "Overview", href: "/doctor" },
      { id: "appointments", ico: "📅", name: "Consultations", badgeKey: "consultationsToday", badgeClass: "sb-a", href: "/doctor/appointments" },
      { id: "prescriptions", ico: "💊", name: "Prescriptions", href: "/doctor/prescriptions" },
    ],
  },
  {
    lbl: "Physical Appointments",
    items: [
      { id: "phys-requests", ico: "📥", name: "Appointment Requests", badgeKey: "physRequests", badgeClass: "sb-r", href: "/doctor/physical/requests" },
      { id: "phys-upcoming", ico: "📅", name: "Upcoming Appointments", href: "/doctor/physical/upcoming" },
      { id: "phys-today", ico: "🏥", name: "Today's Appointments", badgeKey: "physToday", badgeClass: "sb-a", href: "/doctor/physical/today" },
      { id: "phys-manual", ico: "📝", name: "Manual Appointments", badgeKey: "physManual", badgeClass: "sb-g", href: "/doctor/physical/manual" },
      { id: "phys-completed", ico: "🏁", name: "Completed", href: "/doctor/physical/completed" },
      { id: "phys-cancelled", ico: "❌", name: "Cancelled", href: "/doctor/physical/cancelled" },
    ],
  },
  {
    lbl: "Clinic Schedule",
    items: [
      { id: "clinic-schedule", ico: "🗓️", name: "Working Hours & Slots", href: "/doctor/clinic-schedule" },
    ],
  },
  {
    lbl: "Online Consultation",
    items: [
      { id: "oc-requests", ico: "📥", name: "Consultation Requests", badgeKey: "ocRequests", badgeClass: "sb-r", href: "/doctor/consultations/requests" },
      { id: "oc-upcoming", ico: "📅", name: "Upcoming Consultations", badgeKey: "ocUpcoming", badgeClass: "sb-a", href: "/doctor/consultations/upcoming" },
      { id: "oc-today", ico: "🗓️", name: "Today's Consultations", badgeKey: "ocToday", badgeClass: "sb-a", href: "/doctor/consultations/today" },
      { id: "oc-ongoing", ico: "🟢", name: "Ongoing Consultations", badgeKey: "ocOngoing", badgeClass: "sb-g", href: "/doctor/consultations/ongoing" },
      { id: "oc-completed", ico: "🏁", name: "Completed", href: "/doctor/consultations/completed" },
      { id: "oc-cancelled", ico: "❌", name: "Cancelled", href: "/doctor/consultations/cancelled" },
      { id: "oc-history", ico: "📜", name: "Consultation History", href: "/doctor/consultations/history" },
    ],
  },
  {
    lbl: "Doctor Availability",
    items: [
      { id: "oc-availability", ico: "🗓️", name: "Online Availability & Slots", href: "/doctor/availability" },
    ],
  },
  {
    lbl: "Patient Q&A",
    items: [
      { id: "qa-new", ico: "📥", name: "New Questions", badgeKey: "qaNew", badgeClass: "sb-r", href: "/doctor/questions" },
      { id: "qa-drafts", ico: "📝", name: "Pending Answers", badgeKey: "qaDrafts", badgeClass: "sb-a", href: "/doctor/questions/drafts" },
      { id: "qa-answered", ico: "💬", name: "Answered", href: "/doctor/questions/answered" },
      { id: "qa-rejected", ico: "⛔", name: "Rejected", href: "/doctor/questions/rejected" },
    ],
  },
  {
    lbl: "Content",
    items: [
      { id: "submit-article", ico: "✍️", name: "Submit Article", href: "/doctor/submit-article" },
      { id: "submit-publication", ico: "🔬", name: "Submit Research", href: "/doctor/submit-publication" },
      { id: "articles", ico: "📰", name: "My Articles", badgeKey: "articles", badgeClass: "sb-g", href: "/doctor/articles" },
    ],
  },
  {
    lbl: "Practice",
    items: [
      { id: "earnings", ico: "💰", name: "Earnings", href: "/doctor/earnings" },
      { id: "reviews", ico: "⭐", name: "Reviews & Ratings", href: "/doctor/reviews" },
    ],
  },
  {
    lbl: "Account",
    items: [
      { id: "profile", ico: "👤", name: "My Profile", href: "/doctor/profile" },
      { id: "settings", ico: "⚙️", name: "Settings", href: "/doctor/settings" },
    ],
  },
];

export const allDoctorNavItems = doctorNav.flatMap((group) => group.items);

export const doctorPageMeta: Record<string, [string, string]> = {
  dashboard: ["Overview", "Good morning — here's your practice at a glance"],
  patients: ["My Patients", "Manage patient records, vitals, and consultation history"],
  appointments: ["Consultations", "Today's schedule and past consultation records"],
  "phys-requests": ["Appointment Requests", "New in-clinic appointment requests awaiting your approval"],
  "phys-upcoming": ["Upcoming Appointments", "Confirmed in-clinic appointments on your calendar"],
  "phys-today": ["Today's Appointments", "In-clinic patients scheduled for today"],
  "phys-manual": ["Manual Appointments", "Walk-in and phone bookings added by your clinic"],
  "phys-completed": ["Completed Appointments", "In-clinic visits that have been completed"],
  "phys-cancelled": ["Cancelled Appointments", "In-clinic appointments that were cancelled"],
  "clinic-schedule": ["Working Hours & Slots", "Set clinic days, hours, slot duration, breaks, and holidays"],
  "oc-requests": ["Consultation Requests", "New online consultation requests awaiting your approval"],
  "oc-upcoming": ["Upcoming Consultations", "Confirmed online consultations on your calendar"],
  "oc-today": ["Today's Consultations", "Online consultations scheduled for today"],
  "oc-ongoing": ["Ongoing Consultations", "Consultations that are live right now"],
  "oc-completed": ["Completed Consultations", "Online consultations that have been completed"],
  "oc-cancelled": ["Cancelled Consultations", "Online consultations that were cancelled"],
  "oc-history": ["Consultation History", "Full record of your past online consultations"],
  "oc-availability": ["Online Availability & Slots", "Set your online consultation days, hours, and slot durations"],
  "qa-new": ["New Questions", "Patient questions awaiting your medical reply"],
  "qa-drafts": ["Pending Answers", "Draft answers you haven't published yet"],
  "qa-answered": ["Answered Questions", "Questions you have answered"],
  "qa-rejected": ["Rejected Questions", "Questions that were declined with a reason"],
  questions: ["New Questions", "Patient questions awaiting your medical reply"],
  prescriptions: ["Prescriptions", "Prescriptions issued to your patients"],
  "patient-notes": ["Patient Notes", "View and manage consultation notes for your patients"],
  "submit-article": ["Submit an Article", "Share evidence-based medical content with our editorial team"],
  articles: ["My Articles", "Published, draft, and in-review articles"],
  "submit-publication": ["Submit Research", "Submit research for the public Research & Publications page"],
  publications: ["My Publications", "Published, draft, and in-review research publications"],
  earnings: ["Earnings", "Consultation revenue and monthly performance"],
  reviews: ["Reviews & Ratings", "Patient feedback and rating breakdown"],
  profile: ["Physician Profile", "Your professional profile and contribution stats"],
  settings: ["Settings", "Account security and notification preferences"],
};

export function doctorRouteId(pathname: string): string {
  const normalized = pathname.replace(/\/+$/, "") || "/doctor";
  if (normalized === "/doctor") return "dashboard";

  let best: DoctorNavItem | undefined;
  for (const item of allDoctorNavItems) {
    if (normalized === item.href || normalized.startsWith(`${item.href}/`)) {
      if (!best || item.href.length > best.href.length) best = item;
    }
  }
  if (best) return best.id;

  const segment = normalized.replace(/^\/doctor\/?/, "").split("/")[0];
  return segment || "dashboard";
}

export function getDoctorPageMeta(pathname: string): [string, string] {
  const id = doctorRouteId(pathname);
  return doctorPageMeta[id] ?? doctorPageMeta.dashboard;
}
