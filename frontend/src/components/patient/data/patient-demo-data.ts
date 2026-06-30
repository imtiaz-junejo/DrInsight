export const HEALTH_SCORE = {
  score: 78,
  status: "Good 🟢",
  desc: "3 metrics need attention",
  metrics: [
    { label: "Heart", value: 88, color: "var(--green)" },
    { label: "Metabolic", value: 65, color: "var(--amber)" },
    { label: "Sleep", value: 70, color: "var(--amber)" },
    { label: "Activity", value: 82, color: "var(--green)" },
  ],
};

export const UPCOMING_CONSULTATIONS = [
  {
    id: "okafor-upcoming",
    initials: "JO",
    avatarBg: "linear-gradient(135deg,var(--blue-dark),var(--blue))",
    doctorName: "Dr. James Okafor",
    specialty: "🧠 Neurology · Board Certified",
    chip: "cc-up",
    chipLabel: "📅 Upcoming",
    cardClass: "upcoming",
    details: ["📹 Video Call", "📅 Tomorrow, June 6", "⏰ 3:00 PM EST", "⏱️ 30 min"],
    note: "📋 **Reason:** Follow-up on recurring migraines. Bring your headache diary.",
    noteHtml: "📋 <strong>Reason:</strong> Follow-up on recurring migraines. Bring your headache diary.",
    canJoin: true,
  },
  {
    id: "mitchell-upcoming",
    initials: "SM",
    avatarBg: "linear-gradient(135deg,var(--teal),#06b6d4)",
    doctorName: "Dr. Sarah Mitchell",
    specialty: "❤️ Cardiology · Board Certified",
    chip: "cc-up",
    chipLabel: "📅 Upcoming",
    cardClass: "upcoming",
    details: ["📞 Phone Call", "📅 June 10, 2026", "⏰ 11:00 AM EST", "⏱️ 20 min"],
    note: "📋 **Reason:** ECG results review. Bring any recent lab reports.",
    noteHtml: "📋 <strong>Reason:</strong> ECG results review. Bring any recent lab reports.",
    canJoin: false,
  },
];

export const PAST_CONSULTATIONS = [
  {
    id: "sharma-completed",
    initials: "PS",
    avatarBg: "linear-gradient(135deg,#059669,#10b981)",
    doctorName: "Dr. Priya Sharma",
    specialty: "🦋 Endocrinology · FCPS",
    chip: "cc-done",
    chipLabel: "✓ Completed",
    cardClass: "completed",
    details: ["💬 Chat", "📅 May 28, 2026", "⏱️ 25 min", "⭐ Rated 5/5"],
    note: "📝 **Doctor's Note:** HbA1c slightly elevated at 6.2%. Continue current diet plan. Recheck in 3 months. Metformin 500mg BD initiated.",
    noteHtml:
      "📝 <strong>Doctor's Note:</strong> HbA1c slightly elevated at 6.2%. Continue current diet plan. Recheck in 3 months. Metformin 500mg BD initiated.",
    noteGreen: true,
    showReview: true,
  },
  {
    id: "okafor-completed",
    initials: "JO",
    avatarBg: "linear-gradient(135deg,var(--blue-dark),var(--blue))",
    doctorName: "Dr. James Okafor",
    specialty: "🧠 Neurology · Board Certified",
    chip: "cc-done",
    chipLabel: "✓ Completed",
    cardClass: "completed",
    details: ["📹 Video Call", "📅 May 14, 2026", "⏱️ 40 min"],
    note: "📝 **Doctor's Note:** Migraines likely tension-type. Prescribed Sumatriptan 50mg PRN. Avoid known triggers.",
    noteHtml:
      "📝 <strong>Doctor's Note:</strong> Migraines likely tension-type. Prescribed Sumatriptan 50mg PRN. Avoid known triggers.",
    noteGreen: true,
    showReview: false,
  },
];

export const VITALS = [
  { val: "122/80", unit: "mmHg", label: "Blood Pressure", badge: "vb-n", badgeLabel: "Normal" },
  { val: "72", unit: "bpm", label: "Heart Rate", badge: "vb-n", badgeLabel: "Normal" },
  { val: "98%", unit: "SpO₂", label: "Oxygen Sat.", badge: "vb-n", badgeLabel: "Normal" },
  { val: "23.4", unit: "kg/m²", label: "BMI", badge: "vb-n", badgeLabel: "Normal" },
  { val: "6.2%", unit: "HbA1c", label: "Blood Sugar", badge: "vb-l", badgeLabel: "Borderline" },
  { val: "36.6", unit: "°C", label: "Temp.", badge: "vb-n", badgeLabel: "Normal" },
];

export const EXTENDED_VITALS = [
  ...VITALS,
  { val: "145", unit: "mg/dL", label: "LDL Cholesterol", badge: "vb-l", badgeLabel: "Borderline" },
  { val: "98%", unit: "SpO₂", label: "O₂ Saturation", badge: "vb-n", badgeLabel: "Normal" },
  { val: "7,240", unit: "steps", label: "Daily Average", badge: "vb-n", badgeLabel: "Good" },
];

export const MEDICATIONS = [
  {
    icon: "💊",
    iconBg: "#eff6ff",
    name: "Sumatriptan 50mg",
    dose: "As needed — Migraine attacks",
    next: "Prescribed by Dr. Okafor",
    nextColor: "var(--blue)",
    status: "ms-active",
    statusLabel: "Active",
  },
  {
    icon: "💊",
    iconBg: "#f0fdf4",
    name: "Vitamin D3 1000IU",
    dose: "Once daily — Morning with food",
    next: "Next dose: Tomorrow AM",
    nextColor: "var(--green)",
    status: "ms-active",
    statusLabel: "Active",
  },
  {
    icon: "💊",
    iconBg: "#fffbeb",
    name: "Metformin 500mg",
    dose: "Twice daily — With meals",
    next: "⚠️ Refill needed in 3 days",
    nextColor: "var(--red)",
    status: "ms-refill",
    statusLabel: "Refill Soon",
  },
];

export const DOCTOR_REPLIES = [
  {
    initials: "SM",
    avatarBg: "linear-gradient(135deg,var(--blue-dark),var(--blue))",
    name: "Dr. Sarah Mitchell",
    time: "2 hours ago",
    question: "I have been having occasional palpitations, especially after coffee.",
    answer:
      "This is likely due to caffeine sensitivity. Reduce coffee intake to 1 cup/day and monitor. If palpitations persist with shortness of breath, seek immediate care.",
  },
  {
    initials: "PS",
    avatarBg: "linear-gradient(135deg,#059669,#10b981)",
    name: "Dr. Priya Sharma",
    time: "Yesterday",
    question: "Is my Metformin dose sufficient for my HbA1c of 6.2%?",
    answer:
      "500mg BD is appropriate for your current borderline HbA1c. Continue lifestyle modifications — results in 3 months will guide any dose changes.",
  },
];

export const SAVED_ARTICLES = [
  {
    emoji: "🧠",
    bg: "#fce7f3,#fbcfe8",
    cat: "Neurology",
    title: "Migraine vs Tension Headache: How to Tell the Difference",
    meta: "Dr. Okafor · 7 min read",
    pct: 65,
  },
  {
    emoji: "❤️",
    bg: "#fef3c7,#fde68a",
    cat: "Cardiology",
    title: "Understanding Your ECG Results: A Patient's Guide",
    meta: "Dr. Mitchell · 10 min read",
    pct: 40,
  },
  {
    emoji: "🧠",
    bg: "#dbeafe,#bfdbfe",
    cat: "Psychiatry",
    title: "Anxiety Disorders: Causes, Types & Treatments",
    meta: "Dr. Chen · 9 min read",
    pct: 0,
  },
];

export const SAVED_ARTICLES_FULL = [
  ...SAVED_ARTICLES.map((a, i) => ({
    ...a,
    by: a.meta.split(" · ")[0],
    date: ["Jun 1, 2026", "May 22, 2026", "May 15, 2026"][i],
    rt: a.meta.split(" · ")[1]?.replace(" read", "") ?? "7 min",
  })),
  {
    emoji: "🩸",
    bg: "#f0fdf4,#dcfce7",
    cat: "Endocrinology",
    title: "Pre-Diabetes: What It Means and How to Reverse It",
    by: "Dr. Sharma",
    date: "May 10, 2026",
    rt: "12 min",
    meta: "By Dr. Sharma · May 10, 2026 · 12 min read",
    pct: 100,
  },
];

export const RECENT_ACTIVITY = [
  { dot: "ad-g", icon: "💬", text: "<strong>Dr. Mitchell</strong> replied to your palpitations question", time: "2 hours ago" },
  { dot: "ad-b", icon: "📅", text: "Consultation with <strong>Dr. Okafor</strong> confirmed for tomorrow at 3 PM", time: "5 hours ago" },
  { dot: "ad-b", icon: "🔖", text: 'You saved <strong>"Migraine vs Headache"</strong> — 65% read', time: "Yesterday" },
  { dot: "ad-a", icon: "🔧", text: "Completed <strong>Heart Risk Calculator</strong> — Result: Low risk", time: "2 days ago" },
  { dot: "ad-g", icon: "✅", text: "Consultation with <strong>Dr. Priya Sharma</strong> completed", time: "May 28, 2026" },
  { dot: "ad-r", icon: "⚠️", text: "<strong>Metformin</strong> refill due in 3 days — Contact pharmacy", time: "May 28, 2026" },
];

export const HEALTH_TOOLS = [
  { icon: "⚖️", name: "BMI Calculator", sub: "Score: 23.4 ✓", toast: "Opening BMI Calculator..." },
  { icon: "❤️", name: "Heart Risk", sub: "Result: Low", toast: "Opening Heart Risk..." },
  { icon: "🩸", name: "Diabetes Risk", sub: "Result: Moderate", toast: "Opening Diabetes Risk..." },
  { icon: "🫁", name: "Lung Age", sub: "Not taken yet", toast: "Opening Lung Age..." },
  { icon: "🧠", name: "Mental Health", sub: "Not taken yet", toast: "Opening Mental Health..." },
  { icon: "🔎", name: "Symptom Checker", sub: "Try it now", toast: "Opening Symptom Checker..." },
];

export const PATIENT_QUESTIONS = [
  {
    q: "Is it safe to take metformin with ibuprofen?",
    a: "Dr. Ahmed Raza answered: Generally, short-term use is acceptable, but prolonged NSAID use with metformin requires careful monitoring of renal function.",
    date: "Jun 2, 2026",
    status: "completed" as const,
  },
  {
    q: "What are early signs of vitamin D deficiency?",
    a: "Awaiting response from a specialist. Typical response time is 24–48 hours.",
    date: "Jun 4, 2026",
    status: "pending" as const,
  },
  {
    q: "How often should I check my blood pressure at home?",
    a: "Dr. Priya Sharma answered: For patients with borderline hypertension, twice daily readings are recommended for the first few weeks...",
    date: "May 18, 2026",
    status: "completed" as const,
  },
  {
    q: "Can stress cause chest tightness without cardiac issues?",
    a: "Dr. Ahmed Raza answered: Yes — musculoskeletal pain, anxiety, and GERD are common non-cardiac causes. An ECG is still advisable...",
    date: "Apr 30, 2026",
    status: "completed" as const,
  },
];

export const HEALTH_TOOL_HISTORY = [
  { tool: "⚖️ BMI Calculator", result: "23.4 — Normal", resultClass: "st-active", date: "Jun 1, 2026", notes: "Healthy range" },
  { tool: "❤️ Heart Risk Calculator", result: "8% — Moderate", resultClass: "st-followup", date: "May 28, 2026", notes: "Consult recommended" },
  { tool: "🩸 Diabetes Risk", result: "Borderline", resultClass: "st-followup", date: "May 20, 2026", notes: "HbA1c elevated" },
  { tool: "🧠 Mental Health (PHQ-9)", result: "Score 4 — Minimal", resultClass: "st-active", date: "May 10, 2026", notes: "Follow up in 3 months" },
];

export const PERSONAL_INFO = [
  ["Full Name", "Sarah Johnson"],
  ["Email Address", "sarah.johnson@email.com"],
  ["Phone Number", "+1 (555) 234-5678"],
  ["Date of Birth", "March 15, 1992"],
  ["Gender", "Female"],
  ["Blood Group", "A+"],
  ["Country", "United States"],
  ["City", "New York, NY"],
  ["Member Since", "January 2025"],
  ["Account Status", "✅ Active"],
] as const;

export const MEDICAL_INFO = [
  ["Allergies", "Penicillin, Sulfa"],
  ["Chronic Conditions", "Pre-diabetes, Migraines"],
  ["Current Medications", "3 active"],
  ["Last Check-up", "May 28, 2026"],
  ["Primary Doctor", "Dr. James Okafor"],
  ["Insurance", "BlueCross BlueShield"],
  ["Insurance ID", "BCB-77823441"],
  ["Emergency Contact", "John Johnson (Spouse)"],
] as const;
