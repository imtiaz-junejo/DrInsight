export interface AdminNavItem {
  id: string;
  ico: string;
  name: string;
  badge?: string;
  href: string;
}

export interface AdminNavGroup {
  lbl: string;
  items: AdminNavItem[];
}

export const adminNav: AdminNavGroup[] = [
  {
    lbl: "Overview",
    items: [{ id: "dashboard", ico: "📊", name: "Dashboard", href: "/admin" }],
  },
  {
    lbl: "Security & Compliance",
    items: [{ id: "audit-log", ico: "🛡️", name: "Audit & Activity Log", badge: "1", href: "/admin/audit-log" }],
  },
  {
    lbl: "User Management",
    items: [
      { id: "users", ico: "👥", name: "Users", href: "/admin/users" },
      { id: "doctors", ico: "👨‍⚕️", name: "Doctors", href: "/admin/doctors" },
      { id: "patients", ico: "🧑‍🤝‍🧑", name: "Patients", href: "/admin/patients" },
      { id: "roles", ico: "🔑", name: "Roles & Permissions", href: "/admin/roles" },
    ],
  },
  {
    lbl: "Consultation Management",
    items: [
      { id: "appointments", ico: "📅", name: "Appointments", href: "/admin/appointments" },
      { id: "payments", ico: "💳", name: "Payments", href: "/admin/payments" },
      { id: "consult-requests", ico: "📥", name: "Consultation Requests", badge: "7", href: "/admin/consult-requests" },
      { id: "prescriptions", ico: "💊", name: "Prescriptions", href: "/admin/prescriptions" },
    ],
  },
  {
    lbl: "Content Management",
    items: [
      { id: "blog-posts", ico: "📰", name: "Blog Posts", href: "/admin/blog-posts" },
      { id: "categories", ico: "🏷️", name: "Categories", href: "/admin/categories" },
      { id: "tags", ico: "#️⃣", name: "Tags", href: "/admin/tags" },
      { id: "comments", ico: "💬", name: "Comments", badge: "4", href: "/admin/comments" },
      { id: "authors", ico: "✍️", name: "Authors", href: "/admin/authors" },
    ],
  },
  {
    lbl: "Editorial Management",
    items: [
      { id: "review-queue", ico: "🔬", name: "Article Review Queue", badge: "5", href: "/admin/review-queue" },
      { id: "publication-review", ico: "📤", name: "Publication Review", badge: "3", href: "/admin/publication-review" },
      { id: "review-process", ico: "📋", name: "Medical Review Process", href: "/admin/review-process" },
      { id: "editorial-policy", ico: "📜", name: "Editorial Policy Mgmt", href: "/admin/editorial-policy" },
      { id: "author-guidelines", ico: "📘", name: "Author Guidelines Mgmt", href: "/admin/author-guidelines" },
    ],
  },
  {
    lbl: "Communication",
    items: [
      { id: "email-templates", ico: "✉️", name: "Email Templates", href: "/admin/email-templates" },
      { id: "otp-templates", ico: "🔢", name: "OTP Templates", href: "/admin/otp-templates" },
      { id: "notifications", ico: "🔔", name: "Notifications", href: "/admin/notifications" },
    ],
  },
  {
    lbl: "Site Management",
    items: [
      { id: "homepage-sections", ico: "🏠", name: "Homepage Sections", href: "/admin/homepage-sections" },
      { id: "health-tools", ico: "🧮", name: "Health Tools", href: "/admin/health-tools" },
      { id: "faqs", ico: "❓", name: "FAQs", href: "/admin/faqs" },
      { id: "contact-inquiries", ico: "📩", name: "Contact Inquiries", badge: "12", href: "/admin/contact-inquiries" },
      { id: "seo-settings", ico: "🔍", name: "SEO Settings", href: "/admin/seo-settings" },
    ],
  },
  {
    lbl: "About Page",
    items: [
      { id: "trusted-partners", ico: "🤝", name: "Trusted Partners", href: "/admin/trusted-partners" },
      { id: "founders-message", ico: "🩺", name: "Founder's Message", href: "/admin/founders-message" },
    ],
  },
  {
    lbl: "Analytics",
    items: [
      { id: "traffic-analytics", ico: "📈", name: "Traffic Analytics", href: "/admin/traffic-analytics" },
      { id: "consultation-analytics", ico: "🩺", name: "Consultation Analytics", href: "/admin/consultation-analytics" },
      { id: "revenue-analytics", ico: "💰", name: "Revenue Analytics", href: "/admin/revenue-analytics" },
    ],
  },
];

export const adminPageMeta: Record<string, [string, string]> = {
  dashboard: ["Dashboard Overview", "Welcome back — here's what's happening today"],
  "audit-log": ["Audit & Activity Log", "Every sensitive action on the platform — who did what, when, and from where"],
  users: ["Users", "Manage all platform users — patients, doctors, and admins"],
  doctors: ["Doctors", "Manage doctor accounts, verification, and specialties"],
  patients: ["Patients", "View and manage patient accounts and health profiles"],
  roles: ["Roles & Permissions", "Configure access levels for Admin, Doctor, and Patient roles"],
  appointments: ["Appointments", "All scheduled consultations across the platform"],
  payments: ["Payments Management", "Platform payments, refunds, and revenue analytics"],
  "consult-requests": ["Consultation Requests", "New consultation bookings awaiting confirmation"],
  prescriptions: ["Prescriptions", "Prescriptions issued by physicians"],
  "blog-posts": ["Blog Posts", "Manage all published, draft, and scheduled articles"],
  categories: ["Categories", "Manage blog content categories"],
  tags: ["Tags", "Manage article tags for search and filtering"],
  comments: ["Comments", "Moderate reader comments across all articles"],
  authors: ["Authors", "Manage author profiles and verification status"],
  "review-queue": ["Article Review Queue", "Articles awaiting medical peer review"],
  "publication-review": ["Publication Review Queue", "Doctor research publications awaiting editorial review and approval"],
  "review-process": ["Medical Review Process", "Configure review tiers, timelines, and reviewer assignments"],
  "editorial-policy": ["Editorial Policy Management", "Edit the public Editorial Policy page content"],
  "author-guidelines": ["Author Guidelines Management", "Edit the public Author Guidelines page content"],
  "email-templates": ["Email Templates", "Manage automated email templates"],
  "otp-templates": ["OTP Templates", "Manage OTP verification message templates"],
  notifications: ["Notifications", "System-wide notification logs and settings"],
  "homepage-sections": ["Homepage Sections", "Manage homepage content blocks and ordering"],
  "health-tools": ["Health Tools", "Manage health calculators and assessment tools"],
  faqs: ["FAQs", "Manage frequently asked questions"],
  "contact-inquiries": ["Contact Inquiries", "Messages submitted through the contact form"],
  "seo-settings": ["SEO Settings", "Manage meta titles, descriptions, and permalinks for all pages"],
  "trusted-partners": ["Trusted Partners & Affiliates", "Add, edit, or remove the partner tiles shown on the About page"],
  "founders-message": ["Founder's Message", "Edit every part of the “A Message from Our Founder” section on the About page"],
  "traffic-analytics": ["Traffic Analytics", "Website traffic, page views, and visitor insights"],
  "consultation-analytics": ["Consultation Analytics", "Appointment volume, completion rates, and specialties"],
  "revenue-analytics": ["Revenue Analytics", "Platform revenue, payouts, and earnings breakdown"],
};

export function adminRouteId(pathname: string): string {
  if (pathname === "/admin" || pathname === "/admin/") return "dashboard";
  const segment = pathname.replace(/^\/admin\/?/, "").split("/")[0];
  return segment || "dashboard";
}

export function getAdminPageMeta(pathname: string): [string, string] {
  const id = adminRouteId(pathname);
  return adminPageMeta[id] ?? adminPageMeta.dashboard;
}

export const allAdminNavItems = adminNav.flatMap((group) => group.items);
