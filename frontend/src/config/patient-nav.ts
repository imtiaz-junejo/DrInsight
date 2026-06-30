export interface PatientNavItem {
  id: string;
  ico: string;
  name: string;
  badge?: string;
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
      { id: "consultations", ico: "📅", name: "My Consultations", badge: "2", badgeClass: "sb-r", href: "/patient/consultations" },
      { id: "health", ico: "❤️", name: "Health Metrics", href: "/patient/health" },
    ],
  },
  {
    lbl: "Ask & Book",
    items: [
      { id: "questions", ico: "💬", name: "My Questions", badge: "1", badgeClass: "sb-a", href: "/patient/questions" },
      { id: "articles", ico: "🔖", name: "Saved Articles", href: "/patient/articles" },
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
  consultations: ["My Consultations", "Upcoming and past doctor consultations"],
  health: ["Health Metrics", "Vitals, health scores, and tool history"],
  questions: ["My Questions", "Questions submitted to our medical team"],
  articles: ["Saved Articles", "Articles you've bookmarked for reading"],
  profile: ["My Profile", "Personal and medical profile information"],
  settings: ["Settings", "Account security and notification preferences"],
};

export function patientRouteId(pathname: string): string {
  if (pathname === "/patient" || pathname === "/patient/") return "dashboard";
  const segment = pathname.replace(/^\/patient\/?/, "").split("/")[0];
  return segment || "dashboard";
}

export function getPatientPageMeta(pathname: string): [string, string] {
  const id = patientRouteId(pathname);
  return patientPageMeta[id] ?? patientPageMeta.dashboard;
}

export const allPatientNavItems = patientNav.flatMap((group) => group.items);
