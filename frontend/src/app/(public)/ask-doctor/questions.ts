export type QAItem = {
  cat: string;
  catLabel: string;
  searchKeywords: string;
  time: string;
  anonymous?: boolean;
  question: string;
  doctor: {
    initials: string;
    avatarBg: string;
    name: string;
    specialty: string;
  };
  answerHtml: string;
  helpfulCount: number;
  tags: string[];
};

export const HERO_STATS = [
  { num: "5,000+", label: "Questions Answered" },
  { num: "200+", label: "Specialist Doctors" },
  { num: "24–48h", label: "Response Time" },
  { num: "100%", label: "Free Service" },
];

export const HERO_PILLS = [
  "🔒 Anonymous option available",
  "✅ Medically reviewed answers",
  "🆓 Always free",
];

export const CAT_FILTERS = [
  { val: "all", label: "All Categories" },
  { val: "cardiology", label: "❤️ Cardiology" },
  { val: "neurology", label: "🧠 Neurology" },
  { val: "diabetes", label: "🩸 Diabetes" },
  { val: "womens", label: "🤰 Women's Health" },
  { val: "mental", label: "🧘 Mental Health" },
  { val: "pediatrics", label: "👶 Pediatrics" },
  { val: "dermatology", label: "🦷 Dermatology" },
];

export const FORM_CATEGORIES = [
  "General Medicine",
  "Men's Health",
  "Women's Health",
  "Fertility & Reproductive Health",
  "Mental Health & Psychiatry",
  "Child Health & Pediatrics",
  "Heart Health & Cardiology",
  "Diabetes & Endocrinology",
  "Neurology",
  "Pulmonology (Respiratory Medicine)",
  "Gastroenterology (Digestive Health)",
  "Nephrology (Kidney Health)",
  "Hematology (Blood Disorders)",
  "Oncology (Cancer Care)",
  "Rheumatology (Arthritis & Autoimmune)",
  "Dermatology (Skin Health)",
  "Infectious Diseases",
  "Allergy & Immunology",
  "Geriatric Medicine (Senior Health)",
  "Orthopedics (Bones & Joints)",
  "Urology",
  "Obstetrics & Gynecology",
  "Ophthalmology (Eye Care)",
  "ENT (Ear, Nose & Throat)",
  "Nutrition & Lifestyle Medicine",
  "Preventive Health & Wellness",
];

export const QA_ITEMS: QAItem[] = [
  {
    cat: "cardiology",
    catLabel: "❤️ Cardiology",
    searchKeywords: "chest pain left side breathing",
    time: "🕐 Answered 2 days ago",
    anonymous: true,
    question:
      "I have been experiencing chest pain on the left side that worsens when I breathe deeply. I'm 45 years old. Should I be worried?",
    doctor: {
      initials: "SM",
      avatarBg: "linear-gradient(135deg,#1a56a0,#0891b2)",
      name: "Dr. Sarah Mitchell",
      specialty: "Cardiologist · 15 yrs experience",
    },
    answerHtml:
      "Left-sided chest pain that worsens with breathing can have several causes — the most common being pleurisy (inflammation of the lung lining), costochondritis (rib cartilage inflammation), or musculoskeletal strain. However, at age 45, cardiac causes must always be ruled out first. <strong>If your pain is sudden, severe, accompanied by shortness of breath, sweating, or radiates to your arm or jaw — call 911 immediately.</strong> If milder and positional, schedule an urgent appointment with your GP for an ECG and chest X-ray within 24–48 hours. Do not ignore this symptom.",
    helpfulCount: 34,
    tags: ["Chest Pain", "Cardiac Risk", "Breathing"],
  },
  {
    cat: "diabetes",
    catLabel: "🩸 Diabetes & Endocrinology",
    searchKeywords: "blood sugar high morning fasting glucose",
    time: "🕐 Answered 4 days ago",
    question:
      'My fasting blood sugar is consistently around 110–120 mg/dL in the morning. My doctor says I\'m "pre-diabetic." What lifestyle changes can actually reverse this?',
    doctor: {
      initials: "PS",
      avatarBg: "linear-gradient(135deg,#059669,#0891b2)",
      name: "Dr. Priya Sharma",
      specialty: "Endocrinologist · 10 yrs experience",
    },
    answerHtml:
      "Pre-diabetes (fasting glucose 100–125 mg/dL) is very much reversible with the right approach. The most evidence-based interventions are: <strong>(1) Weight loss</strong> — even 5–7% of body weight significantly reduces insulin resistance. <strong>(2) Exercise</strong> — 150 minutes of moderate aerobic activity weekly combined with resistance training. <strong>(3) Diet</strong> — reduce refined carbohydrates and sugars; prioritise fibre, lean protein, and healthy fats. The landmark Diabetes Prevention Program showed lifestyle changes reduced progression to Type 2 diabetes by 58%. With your current numbers, you have an excellent window to reverse this.",
    helpfulCount: 78,
    tags: ["Pre-Diabetes", "Blood Sugar", "Diet"],
  },
  {
    cat: "neurology",
    catLabel: "🧠 Neurology",
    searchKeywords: "migraine headache aura visual disturbance",
    time: "🕐 Answered 5 days ago",
    anonymous: true,
    question:
      "I get severe migraines with aura (flashing lights, zig-zag patterns) about twice a month. They last 6–8 hours. What treatment options are available beyond regular painkillers?",
    doctor: {
      initials: "JO",
      avatarBg: "linear-gradient(135deg,#7c3aed,#4a90d9)",
      name: "Dr. James Okafor",
      specialty: "Neurologist · 12 yrs experience",
    },
    answerHtml:
      "Migraine with aura occurring twice monthly is classified as frequent episodic migraine and absolutely warrants specialist treatment. Beyond OTC analgesics, effective options include: <strong>Triptans</strong> (sumatriptan, rizatriptan) — specific migraine abortives that work on serotonin receptors. <strong>CGRP antagonists</strong> (ubrogepant, rimegepant) — newer, highly effective and better tolerated. For prevention at your frequency, consider <strong>topiramate, propranolol, or CGRP monoclonal antibodies</strong> (erenumab, fremanezumab). Keeping a migraine diary to identify triggers (hormones, sleep, diet) is also essential. I'd recommend a neurology referral.",
    helpfulCount: 52,
    tags: ["Migraine", "Aura", "Neurology"],
  },
  {
    cat: "womens",
    catLabel: "🤰 Women's Health",
    searchKeywords: "irregular periods PCOS hormones cycle",
    time: "🕐 Answered 1 week ago",
    question:
      "My periods have been irregular (every 35–60 days) for the past year. I also have some facial hair and acne. Could this be PCOS? What tests should I ask for?",
    doctor: {
      initials: "EC",
      avatarBg: "linear-gradient(135deg,#d4537e,#f59e0b)",
      name: "Dr. Emily Chen",
      specialty: "Gynaecologist · 9 yrs experience",
    },
    answerHtml:
      "Your symptoms — irregular cycles (oligomenorrhoea), facial hair (hirsutism), and acne — are a classic presentation of Polycystic Ovary Syndrome (PCOS), which affects 1 in 10 women. PCOS is diagnosed by the Rotterdam Criteria (2 of 3): irregular ovulation, clinical/biochemical hyperandrogenism, or polycystic ovaries on ultrasound. Tests to request: <strong>LH, FSH, testosterone, DHEAS, prolactin, TSH, fasting insulin and glucose, HbA1c</strong>, and a pelvic ultrasound. PCOS is manageable with lifestyle changes, combined oral contraceptives for cycle regulation, and metformin if insulin resistance is present.",
    helpfulCount: 91,
    tags: ["PCOS", "Irregular Periods", "Hormones"],
  },
  {
    cat: "mental",
    catLabel: "🧘 Mental Health",
    searchKeywords: "anxiety panic attacks treatment therapy medication",
    time: "🕐 Answered 1 week ago",
    anonymous: true,
    question:
      "I've been having panic attacks 3–4 times a week for the last month — racing heart, difficulty breathing, feeling of doom. They come out of nowhere. What should I do?",
    doctor: {
      initials: "EC",
      avatarBg: "linear-gradient(135deg,#7c3aed,#ec4899)",
      name: "Dr. Emily Chen",
      specialty: "Psychiatrist · 9 yrs experience",
    },
    answerHtml:
      "Frequent panic attacks at this intensity require professional evaluation. First, see your GP to rule out medical causes (thyroid, cardiac arrhythmia). For panic disorder, the most evidence-based treatments are: <strong>CBT (Cognitive Behavioural Therapy)</strong> — particularly exposure therapy, with 70–90% success rates. <strong>SSRIs</strong> (sertraline, escitalopram) — first-line pharmacological treatment, typically takes 4–6 weeks to work. <strong>Short-term benzodiazepines</strong> may help acute episodes but are not for long-term use. Immediate self-help: diaphragmatic breathing (4-7-8 technique) during attacks. You don't have to live with this — it's very treatable.",
    helpfulCount: 63,
    tags: ["Panic Attacks", "Anxiety", "CBT"],
  },
  {
    cat: "pediatrics",
    catLabel: "👶 Pediatrics",
    searchKeywords: "child fever high temperature when to worry",
    time: "🕐 Answered 2 weeks ago",
    question:
      "My 3-year-old has had a fever of 38.8°C (101.8°F) for 2 days. She's eating less but still playing. When should I take her to the emergency room vs. monitor at home?",
    doctor: {
      initials: "CR",
      avatarBg: "linear-gradient(135deg,#f59e0b,#059669)",
      name: "Dr. Carlos Rivera",
      specialty: "Paediatrician · 14 yrs experience",
    },
    answerHtml:
      "At 38.8°C for 2 days in a 3-year-old who is still alert and playing, home monitoring is appropriate for now. Continue paracetamol or ibuprofen for comfort, ensure good hydration (fluids every hour), and monitor closely. <strong>Go to the ER immediately if:</strong> temperature rises above 40°C, she develops a non-blanching rash, has difficulty breathing, becomes very lethargic or inconsolable, has a febrile seizure, or the fever persists beyond 5 days. <strong>See your GP within 24 hours if:</strong> she stops drinking fluids, develops ear pain, or you're simply concerned — trust your instincts as a parent.",
    helpfulCount: 47,
    tags: ["Child Fever", "Paediatrics", "Emergency Signs"],
  },
];

export const SPECIALTIES = [
  { icon: "❤️", label: "Heart Health & Cardiology" },
  { icon: "🧠", label: "Neurology" },
  { icon: "🫁", label: "Pulmonology" },
  { icon: "🩸", label: "Diabetes & Endocrinology" },
  { icon: "🤰", label: "Women's Health" },
  { icon: "👶", label: "Child Health & Pediatrics" },
  { icon: "🧘", label: "Mental Health & Psychiatry" },
  { icon: "🦴", label: "Orthopedics" },
  { icon: "🦠", label: "Infectious Diseases" },
  { icon: "🧬", label: "Oncology" },
  { icon: "👁️", label: "Ophthalmology" },
  { icon: "🦷", label: "Dermatology" },
  { icon: "💊", label: "General Medicine" },
  { icon: "🫘", label: "Nephrology (Kidney)" },
  { icon: "🍎", label: "Nutrition & Lifestyle" },
  { icon: "🔬", label: "Allergy & Immunology" },
];

export const FAQ_ITEMS = [
  {
    q: "Is the Ask the Doctor service really free?",
    a: "Yes — completely free, no hidden charges. Our doctors volunteer their time to answer public health questions as part of our mission to democratise access to medical information. For personalised, in-depth consultations with your specific medical records and test results, we offer paid video/phone consultations.",
  },
  {
    q: "How long does it take to receive an answer?",
    a: "Most questions are answered within 24–48 hours by a board-certified specialist in the relevant field. Urgent or complex questions may take up to 72 hours. You'll receive an email notification when your question is answered. We aim to respond to all questions within our published timeframe.",
  },
  {
    q: "Can I submit my question anonymously?",
    a: 'Absolutely. Simply tick the "Submit anonymously" checkbox in the form. Your name will not be displayed publicly — only your question and the doctor\'s answer will be visible. You can still provide your email for a private notification when your answer is ready.',
  },
  {
    q: "Which doctors answer the questions?",
    a: "All answers are provided by board-certified, licensed physicians with an average of 12+ years of clinical experience. Each question is routed to a specialist in the relevant field — a cardiology question goes to a cardiologist, a neurology question to a neurologist, and so on. Every answer is also reviewed by our senior medical editor before publication.",
  },
  {
    q: "Can the doctor diagnose my condition through this service?",
    a: "No — our Ask the Doctor service provides general medical information and guidance, not a formal diagnosis. A diagnosis requires a full clinical examination, medical history review, and often lab tests or imaging. Our doctors will provide evidence-based information and guidance on next steps, but cannot replace an in-person consultation for diagnostic purposes.",
  },
  {
    q: "What if I need a more personalised consultation?",
    a: "For a thorough, personalised medical consultation where the doctor can review your full history, symptoms, and test results, book a Video, Phone, or Chat Consultation via our Book Consultation page. Fees start from $49 for a 20-minute consultation with a specialist of your choice. Same-day appointments are available.",
  },
  {
    q: "Is my personal information kept private?",
    a: "Yes. We are fully HIPAA and GDPR compliant. Your personal information, email address, and any identifying details are never displayed publicly. We use 256-bit SSL encryption for all data transmission and never sell or share your data with third parties. See our Privacy Policy for full details.",
  },
];
