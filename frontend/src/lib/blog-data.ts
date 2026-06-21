export interface BlogPost {
  slug: string;
  category: string;
  categoryKey: string;
  emoji: string;
  bg: string;
  badgeColor: string;
  labelColor: string;
  title: string;
  excerpt: string;
  author: string;
  authorInitials: string;
  readTime: string;
  date: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "heart-disease-warning-signs",
    category: "Cardiology",
    categoryKey: "cardiology",
    emoji: "❤️",
    bg: "#fef2f2",
    badgeColor: "#dc2626",
    labelColor: "#dc2626",
    title: "10 Early Warning Signs of Heart Disease You Should Never Ignore",
    excerpt:
      "Cardiologists reveal subtle symptoms often dismissed — from jaw pain to ankle swelling — that could signal serious cardiac risk.",
    author: "Dr. Sarah Mitchell",
    authorInitials: "SM",
    readTime: "6 min",
    date: "May 28, 2026",
  },
  {
    slug: "reverse-pre-diabetes",
    category: "Diabetes & Endocrinology",
    categoryKey: "diabetes",
    emoji: "🩸",
    bg: "#fffbeb",
    badgeColor: "#d97706",
    labelColor: "#d97706",
    title: "How to Reverse Pre-Diabetes Naturally: A Clinician's Evidence-Based Guide",
    excerpt:
      "The landmark DPP trial showed lifestyle changes cut diabetes risk by 58%. Here's exactly what to do, based on the evidence.",
    author: "Dr. Priya Sharma",
    authorInitials: "PS",
    readTime: "9 min",
    date: "May 25, 2026",
  },
  {
    slug: "migraine-vs-headache",
    category: "Neurology",
    categoryKey: "neurology",
    emoji: "🧠",
    bg: "#f3f0ff",
    badgeColor: "#7c3aed",
    labelColor: "#7c3aed",
    title: "Migraine vs Headache: How to Tell the Difference and When to See a Doctor",
    excerpt:
      "Not all head pain is the same. A neurologist explains the key distinctions and what each type means for your health.",
    author: "Dr. James Okafor",
    authorInitials: "JO",
    readTime: "7 min",
    date: "May 22, 2026",
  },
  {
    slug: "understanding-anxiety-disorders",
    category: "Mental Health & Psychiatry",
    categoryKey: "mental",
    emoji: "🧘",
    bg: "#eef2ff",
    badgeColor: "#4f46e5",
    labelColor: "#4f46e5",
    title: "Understanding Anxiety Disorders: Types, Triggers, and the Most Effective Treatments",
    excerpt:
      "A psychiatrist's comprehensive guide to the anxiety spectrum — from GAD to panic disorder — and what actually works.",
    author: "Dr. Emily Chen",
    authorInitials: "EC",
    readTime: "11 min",
    date: "May 20, 2026",
  },
  {
    slug: "pcos-explained",
    category: "Women's Health",
    categoryKey: "womens",
    emoji: "🤰",
    bg: "#fdf2f8",
    badgeColor: "#db2777",
    labelColor: "#db2777",
    title: "PCOS Explained: Symptoms, Diagnosis, and a Complete Management Plan",
    excerpt:
      "Affecting 1 in 10 women, PCOS is often misunderstood. A gynaecologist explains the full picture from hormones to fertility.",
    author: "Dr. Emily Chen",
    authorInitials: "EC",
    readTime: "10 min",
    date: "May 18, 2026",
  },
  {
    slug: "anti-inflammatory-diet",
    category: "Nutrition & Lifestyle",
    categoryKey: "nutrition",
    emoji: "🍎",
    bg: "#ecfdf5",
    badgeColor: "#059669",
    labelColor: "#059669",
    title: "The Anti-Inflammatory Diet: A Physician's Guide to Eating for Long-Term Health",
    excerpt:
      "Chronic inflammation drives heart disease, cancer, and diabetes. Here's exactly what to eat — and avoid — according to the evidence.",
    author: "Dr. Priya Sharma",
    authorInitials: "PS",
    readTime: "8 min",
    date: "May 15, 2026",
  },
];

export function getPostBySlug(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}
