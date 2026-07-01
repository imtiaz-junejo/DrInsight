export type Doctor = {
  init: string;
  name: string;
  spec: string;
  specLabel: string;
  cred: string;
  inst: string;
  country: string;
  countryLabel: string;
  exp: number;
  rating: number;
  reviews: number;
  articles: number;
  online: boolean;
  bg: string;
  tags: string[];
};

export const DOCTORS: Doctor[] = [
  {
    init: "JK",
    name: "Dr. Javed Kumbhar",
    spec: "cardiology",
    specLabel: "❤️ Cardiology · Internal Medicine",
    cred: "MBBS, MD, FCPS",
    inst: "Aga Khan University Hospital",
    country: "pakistan",
    countryLabel: "🇵🇰 Karachi, Pakistan",
    exp: 20,
    rating: 4.9,
    reviews: 312,
    articles: 47,
    online: true,
    bg: "linear-gradient(135deg,#0f3d7a,#1a56a0)",
    tags: ["Heart Failure", "Hypertension", "Founder"],
  },
  {
    init: "SM",
    name: "Dr. Sarah Mitchell",
    spec: "cardiology",
    specLabel: "❤️ Cardiology",
    cred: "MBBS, MD, MRCP",
    inst: "King's College Hospital",
    country: "uk",
    countryLabel: "🇬🇧 London, UK",
    exp: 15,
    rating: 4.8,
    reviews: 198,
    articles: 32,
    online: true,
    bg: "linear-gradient(135deg,#dc2626,#f59e0b)",
    tags: ["Arrhythmia", "Cardiac Imaging", "Preventive Cardiology"],
  },
  {
    init: "JO",
    name: "Dr. James Okafor",
    spec: "neurology",
    specLabel: "🧠 Neurology",
    cred: "MBBS, MD, MRCP",
    inst: "NYU Langone Medical Center",
    country: "usa",
    countryLabel: "🇺🇸 New York, USA",
    exp: 12,
    rating: 4.9,
    reviews: 264,
    articles: 38,
    online: false,
    bg: "linear-gradient(135deg,#7c3aed,#4a90d9)",
    tags: ["Migraine", "Neuro-Oncology", "Movement Disorders"],
  },
  {
    init: "PS",
    name: "Dr. Priya Sharma",
    spec: "endocrinology",
    specLabel: "🦋 Endocrinology",
    cred: "MBBS, MD, FRCP",
    inst: "AIIMS New Delhi",
    country: "india",
    countryLabel: "🇮🇳 New Delhi, India",
    exp: 14,
    rating: 4.8,
    reviews: 221,
    articles: 29,
    online: true,
    bg: "linear-gradient(135deg,#059669,#0891b2)",
    tags: ["Diabetes", "Thyroid Disorders", "Obesity Medicine"],
  },
  {
    init: "EC",
    name: "Dr. Emily Chen",
    spec: "psychiatry",
    specLabel: "🧠 Psychiatry · Women's Health",
    cred: "MD, Board Certified",
    inst: "Stanford Medicine",
    country: "usa",
    countryLabel: "🇺🇸 San Francisco, USA",
    exp: 11,
    rating: 4.9,
    reviews: 175,
    articles: 24,
    online: true,
    bg: "linear-gradient(135deg,#db2777,#f59e0b)",
    tags: ["Mood Disorders", "Women's Mental Health", "CBT"],
  },
  {
    init: "CR",
    name: "Dr. Carlos Rivera",
    spec: "pediatrics",
    specLabel: "🧒 Pediatrics",
    cred: "MD, Board Certified",
    inst: "Children's Hospital Los Angeles",
    country: "usa",
    countryLabel: "🇺🇸 Los Angeles, USA",
    exp: 10,
    rating: 4.7,
    reviews: 142,
    articles: 19,
    online: false,
    bg: "linear-gradient(135deg,#d97706,#059669)",
    tags: ["Infectious Disease", "Vaccines", "Neonatology"],
  },
  {
    init: "AH",
    name: "Dr. Ahmed Hassan",
    spec: "orthopedics",
    specLabel: "🦴 Orthopedics",
    cred: "MBBS, FRCS",
    inst: "Cleveland Clinic Abu Dhabi",
    country: "uk",
    countryLabel: "🇬🇧 Manchester, UK",
    exp: 17,
    rating: 4.7,
    reviews: 163,
    articles: 21,
    online: true,
    bg: "linear-gradient(135deg,#475569,#0891b2)",
    tags: ["Sports Medicine", "Joint Replacement", "Spine Surgery"],
  },
];

export const SPECIALTY_FILTERS = [
  { val: "all", label: "All Specialties" },
  { val: "cardiology", label: "❤️ Cardiology" },
  { val: "neurology", label: "🧠 Neurology" },
  { val: "endocrinology", label: "🦋 Endocrinology" },
  { val: "psychiatry", label: "🧠 Psychiatry" },
  { val: "pediatrics", label: "🧒 Pediatrics" },
  { val: "orthopedics", label: "🦴 Orthopedics" },
  { val: "internal medicine", label: "🩺 Internal Medicine" },
];

export const COUNTRY_FILTERS = [
  { val: "all", label: "All Countries" },
  { val: "pakistan", label: "🇵🇰 Pakistan" },
  { val: "usa", label: "🇺🇸 USA" },
  { val: "uk", label: "🇬🇧 UK" },
  { val: "india", label: "🇮🇳 India" },
];

export const AVAIL_FILTERS = [
  { val: "all", label: "All" },
  { val: "online", label: "🟢 Online Now" },
  { val: "rating4plus", label: "⭐ 4.5+ Rating" },
];

export const HERO_STATS = [
  { num: "200+", label: "Verified Doctors" },
  { num: "12", label: "Specialties" },
  { num: "8", label: "Countries" },
  { num: "4.8★", label: "Avg. Rating" },
];
