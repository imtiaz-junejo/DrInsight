export type AccountType = "patient" | "physician";
export type SubType =
  | "indiv"
  | "parent"
  | "caregiver"
  | "student"
  | "specialist"
  | "gp"
  | "surgeon"
  | "resident"
  | "";

export const PATIENT_SUBS = [
  { id: "indiv" as const, icon: "👤", title: "Individual Patient", desc: "Managing my own health" },
  { id: "parent" as const, icon: "👨‍👩‍👦", title: "Parent / Guardian", desc: "Managing health of a child" },
  { id: "caregiver" as const, icon: "👴", title: "Caregiver for Elder", desc: "Caring for an elderly family member" },
  { id: "student" as const, icon: "🎓", title: "Medical Student", desc: "Studying medicine or health science" },
];

export const PHYSICIAN_SUBS = [
  { id: "specialist" as const, icon: "🩺", title: "Specialist Doctor", desc: "Board-certified in a specialty" },
  { id: "gp" as const, icon: "🔬", title: "General Practitioner", desc: "Primary care / family medicine" },
  { id: "surgeon" as const, icon: "💊", title: "Surgeon", desc: "Surgical specialty practice" },
  { id: "resident" as const, icon: "🏥", title: "Resident / Fellow", desc: "Postgraduate training" },
];

export const PATIENT_HEALTH_TAGS = [
  "❤️ Cardiology",
  "🧠 Neurology",
  "🦋 Endocrinology",
  "🍽️ Gastroenterology",
  "🫘 Nephrology",
  "🧴 Dermatology",
  "🧠 Mental Health",
  "🧒 Pediatrics",
  "🦴 Rheumatology",
  "🫁 Pulmonology",
  "🎗️ Oncology",
  "🦠 Infectious Disease",
  "💊 Medications",
  "🏃 Sports Medicine",
  "😴 Sleep Medicine",
  "🧬 Genetics",
];

export const PHYSICIAN_CLINICAL_TAGS = [
  "❤️ Cardiology",
  "🧠 Neurology",
  "🦋 Endocrinology",
  "🍽️ Gastroenterology",
  "🧴 Dermatology",
  "🧠 Mental Health",
  "🫁 Pulmonology",
  "🎗️ Oncology",
];

export const CONTENT_PREFERENCE_OPTIONS = [
  "📖 Patient-friendly articles",
  "🔬 Clinical / technical content",
  "📋 Both",
] as const;

export const NEWSLETTER_FREQUENCY_OPTIONS = [
  "Daily digest",
  "Weekly highlights",
  "Monthly roundup",
  "No newsletter",
] as const;

export const LANGUAGE_OPTIONS = [
  "English",
  "Urdu",
  "Arabic",
  "Hindi",
  "French",
  "German",
  "Spanish",
  "Other",
] as const;

export const COUNTRY_OPTIONS = [
  "United States",
  "United Kingdom",
  "Pakistan",
  "India",
  "Canada",
  "Australia",
  "Other",
] as const;

export const BLOOD_GROUP_OPTIONS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] as const;

export const REGULATORY_BODY_OPTIONS = [
  "Pakistan Medical Commission (PMC)",
  "General Medical Council (GMC — UK)",
  "American Medical Association (AMA)",
  "Medical Council of India (MCI)",
  "Australian Medical Association (AMA-AU)",
  "Other",
] as const;

export const CONTRIBUTION_OPTIONS = [
  { icon: "✍️", title: "Write Articles", desc: "Share your clinical expertise with patients" },
  { icon: "🔬", title: "Review Content", desc: "Peer-review articles in your specialty" },
  { icon: "💬", title: "Answer Patient Questions", desc: "Respond to Ask the Doctor queries" },
  { icon: "🩺", title: "Consultation Service", desc: "Offer paid consultations to patients" },
] as const;

export const GENDER_OPTIONS = [
  { value: "Female", label: "Female" },
  { value: "Male", label: "Male" },
  { value: "Other", label: "Other" },
] as const;
