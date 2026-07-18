import type { PatientDashboardCounts } from "@/services/patient-api-hooks";

export type PatientBadgeKey = keyof PatientDashboardCounts;

export interface PatientNavItem {
  id: string;
  ico: string;
  name: string;
  badgeKey?: PatientBadgeKey;
  badgeClass?: string;
  href: string;
}

export interface PatientNavGroup {
  lbl: string;
  items: PatientNavItem[];
}

export const patientNav: PatientNavGroup[] = [
  {
    lbl: "My Health",
    items: [
      { id: "dashboard", ico: "📊", name: "Overview", href: "/patient" },
      { id: "health", ico: "❤️", name: "Health Metrics", href: "/patient/health" },
    ],
  },
  {
    lbl: "My Consultations",
    items: [
      { id: "oc-pending", ico: "🕒", name: "Pending Requests", badgeKey: "ocPending", badgeClass: "sb-a", href: "/patient/consultations/pending" },
      { id: "oc-upcoming", ico: "📅", name: "Upcoming", badgeKey: "ocUpcoming", badgeClass: "sb-r", href: "/patient/consultations/upcoming" },
      { id: "oc-ongoing", ico: "🟢", name: "Ongoing", badgeKey: "ocOngoing", badgeClass: "sb-g", href: "/patient/consultations/ongoing" },
      { id: "oc-completed", ico: "✅", name: "Completed", href: "/patient/consultations/completed" },
      { id: "oc-cancelled", ico: "❌", name: "Cancelled", href: "/patient/consultations/cancelled" },
      { id: "oc-history", ico: "📜", name: "Consultation History", href: "/patient/consultations/history" },
    ],
  },
  {
    lbl: "Physical Appointments",
    items: [
      { id: "phys-upcoming", ico: "🏥", name: "Upcoming", badgeKey: "physUpcoming", badgeClass: "sb-r", href: "/patient/physical/upcoming" },
      { id: "phys-pending", ico: "🕒", name: "Pending Requests", badgeKey: "physPending", badgeClass: "sb-a", href: "/patient/physical/pending" },
      { id: "phys-confirmed", ico: "✅", name: "Confirmed", badgeKey: "physConfirmed", badgeClass: "sb-g", href: "/patient/physical/confirmed" },
      { id: "phys-completed", ico: "🏁", name: "Completed", href: "/patient/physical/completed" },
      { id: "phys-cancelled", ico: "❌", name: "Cancelled", href: "/patient/physical/cancelled" },
    ],
  },
  {
    lbl: "Ask & Book",
    items: [
      { id: "qa-ask", ico: "✍️", name: "Ask Question", href: "/patient/questions/ask" },
      { id: "qa-pending", ico: "🕒", name: "Pending Approval", badgeKey: "qaPending", badgeClass: "sb-a", href: "/patient/questions/pending" },
      { id: "qa-answered", ico: "💬", name: "Answered", badgeKey: "qaAnswered", badgeClass: "sb-g", href: "/patient/questions/answered" },
      { id: "qa-rejected", ico: "⛔", name: "Rejected", href: "/patient/questions/rejected" },
      { id: "articles", ico: "🔖", name: "Saved Articles", badgeKey: "savedArticles", href: "/patient/articles" },
    ],
  },
  {
    lbl: "Account",
    items: [
      { id: "profile", ico: "👤", name: "My Profile", href: "/patient/profile" },
      { id: "settings", ico: "⚙️", name: "Settings", href: "/patient/settings" },
    ],
  },
];

export const patientPageMeta: Record<string, [string, string]> = {
  dashboard: ["Overview", "Your health activity and upcoming care at a glance"],
  health: ["Health Metrics", "Vitals, health scores, and tool history"],
  "oc-pending": ["Pending Requests", "Consultation requests awaiting doctor approval"],
  "oc-upcoming": ["Upcoming Consultations", "Accepted consultations scheduled ahead"],
  "oc-ongoing": ["Ongoing Consultations", "Sessions in progress right now"],
  "oc-completed": ["Completed Consultations", "Finished consultations with notes and prescriptions"],
  "oc-cancelled": ["Cancelled Consultations", "Cancelled or rejected consultations"],
  "oc-history": ["Consultation History", "Your full online consultation history"],
  "phys-upcoming": ["Upcoming Physical Appointments", "Confirmed in-person clinic visits coming up"],
  "phys-pending": ["Pending Requests", "Physical appointment requests awaiting approval"],
  "phys-confirmed": ["Confirmed Appointments", "In-person appointments confirmed by the doctor"],
  "phys-completed": ["Completed Visits", "Clinic visits you have completed"],
  "phys-cancelled": ["Cancelled Appointments", "Appointments that were cancelled"],
  "qa-ask": ["Ask a Question", "Submit a question to our medical team"],
  "qa-pending": ["Pending Approval", "Questions awaiting review and response"],
  "qa-answered": ["Answered Questions", "Questions answered by our doctors"],
  "qa-rejected": ["Rejected Questions", "Questions that could not be approved"],
  articles: ["Saved Articles", "Articles you've bookmarked for reading"],
  profile: ["My Profile", "Personal and medical profile information"],
  settings: ["Settings", "Account security and notification preferences"],
};

export function patientRouteId(pathname: string): string {
  if (pathname === "/patient" || pathname === "/patient/") return "dashboard";
  const parts = pathname.replace(/^\/patient\/?/, "").split("/").filter(Boolean);
  if (parts[0] === "consultations") {
    if (!parts[1] || parts[1] === "upcoming") return parts[1] ? `oc-${parts[1]}` : "oc-upcoming";
    return `oc-${parts[1]}`;
  }
  if (parts[0] === "physical" && parts[1]) return `phys-${parts[1]}`;
  if (parts[0] === "questions" && parts[1]) return `qa-${parts[1]}`;
  return parts[0] || "dashboard";
}

export function getPatientPageMeta(pathname: string): [string, string] {
  const id = patientRouteId(pathname);
  return patientPageMeta[id] ?? patientPageMeta.dashboard;
}

export const allPatientNavItems = patientNav.flatMap((group) => group.items);
