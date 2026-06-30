export interface DoctorNavItem {
  id: string;
  ico: string;
  name: string;
  badge?: string;
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
      { id: "patients", ico: "👥", name: "My Patients", badge: "142", badgeClass: "sb-g", href: "/doctor/patients" },
      { id: "appointments", ico: "📅", name: "Consultations", badge: "6", badgeClass: "sb-a", href: "/doctor/appointments" },
      { id: "questions", ico: "💬", name: "Patient Q&A", badge: "12", badgeClass: "sb-r", href: "/doctor/questions" },
      { id: "prescriptions", ico: "💊", name: "Prescriptions", href: "/doctor/prescriptions" },
    ],
  },
  {
    lbl: "Content",
    items: [
      { id: "submit-article", ico: "✍️", name: "Submit Article", href: "/doctor/submit-article" },
      { id: "articles", ico: "📰", name: "My Articles", badge: "47", badgeClass: "sb-g", href: "/doctor/articles" },
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

export const doctorPageMeta: Record<string, [string, string]> = {
  dashboard: ["Overview", "Good morning — here's your practice at a glance"],
  patients: ["My Patients", "Manage patient records, vitals, and consultation history"],
  appointments: ["Consultations", "Today's schedule and past consultation records"],
  questions: ["Patient Q&A", "Questions from patients awaiting your medical reply"],
  prescriptions: ["Prescriptions", "Prescriptions issued to your patients"],
  "submit-article": ["Submit an Article", "Share evidence-based medical content with our editorial team"],
  articles: ["My Articles", "Published, draft, and in-review articles"],
  earnings: ["Earnings", "Consultation revenue and monthly performance"],
  reviews: ["Reviews & Ratings", "Patient feedback and rating breakdown"],
  profile: ["Physician Profile", "Your professional profile and contribution stats"],
  settings: ["Settings", "Account security and notification preferences"],
};

export function doctorRouteId(pathname: string): string {
  if (pathname === "/doctor" || pathname === "/doctor/") return "dashboard";
  const segment = pathname.replace(/^\/doctor\/?/, "").split("/")[0];
  return segment || "dashboard";
}

export function getDoctorPageMeta(pathname: string): [string, string] {
  const id = doctorRouteId(pathname);
  return doctorPageMeta[id] ?? doctorPageMeta.dashboard;
}

export const allDoctorNavItems = doctorNav.flatMap((group) => group.items);
