export interface AdminNavItem {
  id: string;
  ico: string;
  name: string;
  badgeKey?: string;
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
    items: [{ id: "audit-log", ico: "🛡️", name: "Audit & Activity Log", badgeKey: "audit-log", href: "/admin/audit-log" }],
  },
  {
    lbl: "User Management",
    items: [
      { id: "users", ico: "👥", name: "Users", badgeKey: "users", href: "/admin/users" },
      { id: "doctors", ico: "👨‍⚕️", name: "Doctors", href: "/admin/doctors" },
      { id: "doctor-seo", ico: "📇", name: "Doctor Profiles", href: "/admin/doctor-profiles" },
      { id: "patients", ico: "🧑‍🤝‍🧑", name: "Patients", href: "/admin/patients" },
      { id: "roles", ico: "🔑", name: "Roles & Permissions", href: "/admin/roles" },
    ],
  },
  {
    lbl: "Patient Q&A",
    items: [
      { id: "qa-pending", ico: "🕒", name: "Pending Questions", badgeKey: "qa-pending", href: "/admin/questions/pending" },
      { id: "qa-approved", ico: "✅", name: "Approved Questions", href: "/admin/questions/approved" },
      { id: "qa-rejected", ico: "⛔", name: "Rejected Questions", href: "/admin/questions/rejected" },
      { id: "qa-answered", ico: "💬", name: "Answered", href: "/admin/questions/answered" },
      { id: "qa-reports", ico: "📊", name: "Reports", href: "/admin/questions/reports" },
    ],
  },
  {
    lbl: "Consultation Management",
    items: [
      { id: "oc-pending", ico: "🕒", name: "Pending", badgeKey: "oc-pending", href: "/admin/consultations/pending" },
      { id: "oc-approved", ico: "✅", name: "Approved", href: "/admin/consultations/approved" },
      { id: "oc-upcoming", ico: "📅", name: "Upcoming", href: "/admin/consultations/upcoming" },
      { id: "oc-ongoing", ico: "🟢", name: "Ongoing", badgeKey: "oc-ongoing", href: "/admin/consultations/ongoing" },
      { id: "oc-completed", ico: "🏁", name: "Completed", href: "/admin/consultations/completed" },
      { id: "oc-cancelled", ico: "❌", name: "Cancelled", href: "/admin/consultations/cancelled" },
      { id: "oc-reports", ico: "📊", name: "Reports", href: "/admin/consultations/reports" },
      { id: "prescriptions", ico: "💊", name: "Prescriptions", href: "/admin/prescriptions" },
    ],
  },
  {
    lbl: "Physical Consultation Requests",
    items: [
      { id: "phys-pending", ico: "🕒", name: "Pending", badgeKey: "phys-pending", href: "/admin/physical/pending" },
      { id: "phys-approved", ico: "✅", name: "Approved", href: "/admin/physical/approved" },
      { id: "phys-rejected", ico: "⛔", name: "Rejected", href: "/admin/physical/rejected" },
      { id: "phys-upcoming", ico: "📅", name: "Upcoming", href: "/admin/physical/upcoming" },
      { id: "phys-completed", ico: "🏁", name: "Completed", href: "/admin/physical/completed" },
      { id: "phys-cancelled", ico: "❌", name: "Cancelled", href: "/admin/physical/cancelled" },
    ],
  },
  {
    lbl: "Content Management",
    items: [
      { id: "blog-posts", ico: "📰", name: "Blog Posts", href: "/admin/blog-posts" },
      { id: "categories", ico: "🏷️", name: "Categories", href: "/admin/categories" },
      { id: "tags", ico: "#️⃣", name: "Tags", href: "/admin/tags" },
      { id: "comments", ico: "💬", name: "Comments", badgeKey: "comments", href: "/admin/comments" },
      { id: "authors", ico: "✍️", name: "Authors", href: "/admin/authors" },
    ],
  },
  {
    lbl: "Editorial Management",
    items: [
      { id: "review-queue", ico: "🔬", name: "Article Review Queue", badgeKey: "review-queue", href: "/admin/review-queue" },
      { id: "publication-review", ico: "📤", name: "Publication Review", badgeKey: "publication-review", href: "/admin/publication-review" },
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
      { id: "contact-inquiries", ico: "📩", name: "Contact Inquiries", badgeKey: "contact-inquiries", href: "/admin/contact-inquiries" },
      { id: "seo-settings", ico: "🔍", name: "SEO Settings", href: "/admin/seo-settings" },
    ],
  },
  {
    lbl: "About Page",
    items: [
      { id: "about-partners", ico: "🤝", name: "Trusted Partners", href: "/admin/trusted-partners" },
      { id: "about-founder", ico: "🩺", name: "Founder's Message", href: "/admin/founders-message" },
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
  {
    lbl: "Configuration",
    items: [
      { id: "branding-media", ico: "🎨", name: "Branding & Media", href: "/admin/branding-media" },
      { id: "menu-mgmt", ico: "🧭", name: "Menu Management", href: "/admin/menu-mgmt" },
      { id: "contact-details", ico: "📞", name: "Contact", href: "/admin/contact-details" },
      { id: "newsletter-mgmt", ico: "📬", name: "Newsletter", href: "/admin/newsletter-mgmt" },
      { id: "advertisements", ico: "💰", name: "Advertisements", href: "/admin/advertisements" },
      { id: "settings-mgmt", ico: "⚙️", name: "Settings", href: "/admin/settings-mgmt" },
      { id: "backup-security", ico: "🛡", name: "Backup & Security", href: "/admin/backup-security" },
    ],
  },
];

export const adminPageMeta: Record<string, [string, string]> = {
  dashboard: ["Dashboard Overview", "Welcome back — here's what's happening today"],
  "audit-log": ["Audit & Activity Log", "Every sensitive action on the platform — who did what, when, and from where"],
  users: ["Users", "Manage all platform users — patients, doctors, and admins"],
  doctors: ["Doctors", "Manage doctor accounts, verification, and specialties"],
  "doctor-seo": ["Doctor Profiles", "Review & edit each doctor-filled profile, set its SEO, and suspend or reactivate the account"],
  patients: ["Patients", "View and manage patient accounts and health profiles"],
  roles: ["Roles & Permissions", "Configure access levels for Admin, Doctor, and Patient roles"],
  "qa-pending": ["Patient Q&A · Pending Questions", "New patient questions awaiting review — doctors cannot see these yet"],
  "qa-approved": ["Patient Q&A · Approved Questions", "Approved and assigned — visible on the doctor dashboard"],
  "qa-rejected": ["Patient Q&A · Rejected Questions", "Questions returned to patients with a reason"],
  "qa-answered": ["Patient Q&A · Answered", "Doctor answers — instantly visible to patients"],
  "qa-reports": ["Patient Q&A · Reports", "Volume, response & department analytics — export as CSV"],
  "oc-pending": ["Consultation Management · Pending", "New online consultation requests awaiting doctor response"],
  "oc-approved": ["Consultation Management · Approved", "Requests accepted by doctors — with their live status"],
  "oc-upcoming": ["Consultation Management · Upcoming", "Accepted consultations scheduled ahead"],
  "oc-ongoing": ["Consultation Management · Ongoing", "Video, Voice & Chat sessions in progress right now"],
  "oc-completed": ["Consultation Management · Completed", "Finished consultations with notes & e-prescriptions"],
  "oc-cancelled": ["Consultation Management · Cancelled", "Cancelled or rejected consultations across the platform"],
  "oc-reports": ["Consultation Reports", "Volume, revenue & status analytics — export as CSV"],
  "phys-pending": ["Physical Consultation Requests · Pending", "In-person clinic visit requests awaiting approval"],
  "phys-approved": ["Physical Consultation Requests · Approved", "Approved in-person visits awaiting scheduling"],
  "phys-rejected": ["Physical Consultation Requests · Rejected", "Rejected clinic visit requests"],
  "phys-upcoming": ["Physical Consultation Requests · Upcoming", "Scheduled in-person visits ahead"],
  "phys-completed": ["Physical Consultation Requests · Completed", "Completed clinic visits"],
  "phys-cancelled": ["Physical Consultation Requests · Cancelled", "Cancelled physical appointments"],
  prescriptions: ["Prescriptions", "Prescriptions issued by physicians"],
  "blog-posts": ["Blog Posts", "Manage all published, draft, and scheduled articles"],
  categories: ["Categories", "Manage blog content categories"],
  tags: ["Tags", "Manage article tags for search and filtering"],
  comments: ["Comments", "Moderate reader comments across all articles"],
  authors: ["Authors", "Manage author profiles and verification status"],
  "review-queue": ["Article Review Queue", "Articles awaiting medical peer review"],
  "publication-review": ["Publication Review Queue", "Research publications submitted by doctors — review, approve & publish"],
  "review-process": ["Medical Review Process", "Configure review tiers, timelines, and reviewer assignments"],
  "editorial-policy": ["Editorial Policy Management", "Edit the public Editorial Policy page content"],
  "author-guidelines": ["Author Guidelines Management", "Edit the public Author Guidelines page content"],
  "email-templates": ["Email Templates", "Manage automated email templates"],
  "otp-templates": ["OTP Templates", "Manage OTP verification message templates"],
  "newsletter-mgmt": ["Newsletter", "Subscribers, compose & send campaigns, and CSV export"],
  notifications: ["Notifications", "System-wide notification logs and settings"],
  "homepage-sections": ["Homepage Sections", "Manage homepage content blocks and ordering"],
  "health-tools": ["Health Tools", "Manage health calculators and assessment tools"],
  faqs: ["FAQs", "Manage frequently asked questions"],
  "contact-inquiries": ["Contact Inquiries", "Messages submitted through the contact form"],
  "seo-settings": ["SEO Management", "Global meta, social cards, schema, robots.txt, and per-page SEO"],
  "branding-media": ["Branding & Media", "Logos, favicon, hero image, and the media library"],
  "menu-mgmt": ["Menu Management", "Add, reorder, and remove header and footer menu items"],
  "contact-details": ["Contact Details", "Phone, email, address, and map shown across the website"],
  advertisements: ["Advertisements", "AdSense and custom ad placements"],
  "settings-mgmt": ["Settings", "General, email, OTP service, and social links"],
  "backup-security": ["Backup & Security", "Backups, credentials, 2FA, and the activity log"],
  "about-partners": ["Trusted Partners & Affiliates", "Add, edit, or remove the partner tiles shown on the About page"],
  "about-founder": ["Founder's Message", "Edit every part of the “A Message from Our Founder” section on the About page"],
  "trusted-partners": ["Trusted Partners & Affiliates", "Add, edit, or remove the partner tiles shown on the About page"],
  "founders-message": ["Founder's Message", "Edit every part of the “A Message from Our Founder” section on the About page"],
  "traffic-analytics": ["Traffic Analytics", "Website traffic, page views, and visitor insights"],
  "consultation-analytics": ["Consultation Analytics", "Appointment volume, completion rates, and specialties"],
  "revenue-analytics": ["Revenue Analytics", "Platform revenue, payouts, and earnings breakdown"],
  payments: ["Payments Management", "Platform payments, refunds, and revenue analytics"],
  appointments: ["Appointments", "All scheduled consultations across the platform"],
  "consult-requests": ["Consultation Requests", "New consultation bookings awaiting confirmation"],
};

export function adminRouteId(pathname: string): string {
  if (pathname === "/admin" || pathname === "/admin/") return "dashboard";
  const segments = pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);

  if (segments[0] === "questions" && segments[1]) return `qa-${segments[1]}`;
  if (segments[0] === "consultations" && segments[1]) return `oc-${segments[1]}`;
  if (segments[0] === "physical" && segments[1]) return `phys-${segments[1]}`;
  if (segments[0] === "doctor-profiles") return "doctor-seo";
  if (segments[0] === "trusted-partners") return "about-partners";
  if (segments[0] === "founders-message") return "about-founder";

  if (segments[0] === "users" && segments.length >= 2) {
    return segments[2] === "articles" ? "doctor-articles" : "user-profile";
  }
  if (segments[0] === "appointments" && segments.length >= 2) return "appointment-detail";
  if (segments[0] === "blog" && segments.length >= 2) return "blog-article";
  if (segments[0] === "submit-article") return "submit-article";
  return segments[0] || "dashboard";
}

export function getAdminPageMeta(pathname: string): [string, string] {
  const segments = pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);

  if (segments[0] === "questions" && segments[1]) {
    return adminPageMeta[`qa-${segments[1]}`] ?? adminPageMeta["qa-pending"];
  }
  if (segments[0] === "consultations" && segments[1]) {
    return adminPageMeta[`oc-${segments[1]}`] ?? adminPageMeta["oc-pending"];
  }
  if (segments[0] === "physical" && segments[1]) {
    return adminPageMeta[`phys-${segments[1]}`] ?? adminPageMeta["phys-pending"];
  }
  if (segments[0] === "doctor-profiles") {
    return adminPageMeta["doctor-seo"];
  }

  if (segments[0] === "users" && segments.length >= 2) {
    if (segments[2] === "articles") {
      return ["Doctor Articles", "Articles written by this doctor — loaded from PostgreSQL"];
    }
    return ["User Profile", "Complete account details, activity, and related records"];
  }
  if (segments[0] === "appointments" && segments.length >= 2) {
    return ["Appointment Details", "Full consultation record including payment and prescription"];
  }
  if (segments[0] === "blog" && segments.length >= 2) {
    return ["Article Details", "Complete article content and engagement metrics"];
  }
  if (segments[0] === "submit-article") {
    return ["Submit Article", "Create or edit articles using the same editor as the Doctor Dashboard"];
  }
  const id = adminRouteId(pathname);
  return adminPageMeta[id] ?? adminPageMeta.dashboard;
}

export const allAdminNavItems = adminNav.flatMap((group) => group.items);
