import { BlogStatus, QuestionStatus } from '@prisma/client';
import {
  MEDICAL_SPECIALTIES,
  PAKISTANI_CITIES,
  PAKISTANI_FIRST_NAMES_FEMALE,
  PAKISTANI_FIRST_NAMES_MALE,
  PAKISTANI_HOSPITALS,
  PAKISTANI_LAST_NAMES,
  SEED_DOMAIN,
  pick,
} from './seed-data';

export const BLOG_POST_COUNT = 120;
export const ASK_DOCTOR_COUNT = 200;
export const NEWSLETTER_COUNT = 300;
export const CONTACT_COUNT = 100;

export const BLOG_CATEGORIES = [
  {
    name: 'General Health',
    slug: 'general-health',
    description: 'Everyday wellness, preventive care, and health literacy for Pakistani households.',
  },
  {
    name: 'Heart Health',
    slug: 'heart-health',
    description: 'Cardiovascular prevention, hypertension, and heart disease awareness in Pakistan.',
  },
  {
    name: 'Diabetes',
    slug: 'diabetes',
    description: 'Type 1 and Type 2 diabetes management, diet, and monitoring for South Asian patients.',
  },
  {
    name: "Women's Health",
    slug: 'womens-health',
    description: 'Reproductive health, pregnancy, PCOS, and wellness guidance for women in Pakistan.',
  },
  {
    name: "Men's Health",
    slug: 'mens-health',
    description: 'Prostate health, testosterone, workplace stress, and preventive screening for men.',
  },
  {
    name: 'Child Care',
    slug: 'child-care',
    description: 'Pediatric growth, vaccinations, nutrition, and common illnesses in Pakistani children.',
  },
  {
    name: 'Mental Health',
    slug: 'mental-health',
    description: 'Anxiety, depression, stress management, and culturally sensitive mental health support.',
  },
  {
    name: 'Nutrition',
    slug: 'nutrition',
    description: 'Balanced Pakistani diets, Ramadan nutrition, micronutrient deficiency, and healthy eating.',
  },
  {
    name: 'Fitness',
    slug: 'fitness',
    description: 'Exercise routines, physical activity in hot climates, and safe training for all ages.',
  },
  {
    name: 'Skin Care',
    slug: 'skin-care',
    description: 'Dermatology tips for pigmentation, acne, eczema, and sun protection in South Asia.',
  },
  {
    name: 'Dental Care',
    slug: 'dental-care',
    description: 'Oral hygiene, gum disease prevention, and dental visits for Pakistani families.',
  },
  {
    name: 'Eye Care',
    slug: 'eye-care',
    description: 'Vision screening, cataracts, diabetic retinopathy, and digital eye strain.',
  },
  {
    name: 'Infectious Diseases',
    slug: 'infectious-diseases',
    description: 'Dengue, typhoid, hepatitis, COVID-19, and seasonal infections in Pakistan.',
  },
] as const;

const COVER_IMAGES: Record<string, string[]> = {
  'general-health': [
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
  ],
  'heart-health': [
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
    'https://images.unsplash.com/photo-1628348068343-c6a8489622a9?w=800&q=80',
  ],
  diabetes: [
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    'https://images.unsplash.com/photo-1519494026892-80bbd122d64a?w=800&q=80',
  ],
  'womens-health': [
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80',
    'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&q=80',
  ],
  'mens-health': [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
  ],
  'child-care': [
    'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80',
    'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&q=80',
  ],
  'mental-health': [
    'https://images.unsplash.com/photo-1506126615695-1746f858f06f?w=800&q=80',
    'https://images.unsplash.com/photo-1499203531295-0d890fd4f272?w=800&q=80',
  ],
  nutrition: [
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
  ],
  fitness: [
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  ],
  'skin-care': [
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80',
    'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80',
  ],
  'dental-care': [
    'https://images.unsplash.com/photo-1606811841689-23e11a731ee5?w=800&q=80',
    'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80',
  ],
  'eye-care': [
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80',
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
  ],
  'infectious-diseases': [
    'https://images.unsplash.com/photo-1584036561561-d4f6f0b4ddf4?w=800&q=80',
    'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&q=80',
  ],
};

const BLOG_TITLE_TEMPLATES: Record<string, string[]> = {
  'general-health': [
    'Preventive Health Checkups Every Pakistani Adult Should Schedule',
    'Understanding Primary Care and When to Visit Your Family Physician',
    'How Smog Season in Lahore and Karachi Affects Your Daily Health',
    'Building a Home First-Aid Kit for Pakistani Households',
    'Vitamin D Deficiency in Pakistan: Symptoms, Tests, and Treatment',
    'Navigating Health Insurance and Sehat Sahulat in Pakistan',
    'Heat Exhaustion vs Heat Stroke: Warning Signs in Summer',
    'Safe Use of Over-the-Counter Medicines from Local Pharmacies',
    'Health Screenings by Age: A Guide for Adults in Pakistan',
    'Why Regular Blood Pressure Monitoring Matters at Home',
  ],
  'heart-health': [
    'Hypertension in Pakistan: Why It Is Called the Silent Killer',
    'Heart-Healthy Diet Tips Using Everyday Pakistani Foods',
    'Recognizing Heart Attack Symptoms Early: What Families Should Know',
    'Cholesterol Management for South Asian Patients',
    'Stress, Work Culture, and Cardiovascular Risk in Urban Pakistan',
    'When Chest Pain Needs Emergency Care at a Cardiac Center',
    'AFib and Palpitations: When to See a Cardiologist',
    'Rehabilitation After Angioplasty: Lifestyle Changes That Help',
    'Salt Intake in Desi Cuisine and Blood Pressure Control',
    'Exercise After 40: Protecting Your Heart in Hot Weather',
  ],
  diabetes: [
    'Type 2 Diabetes in Pakistan: Rising Rates and Prevention Strategies',
    'Ramadan Fasting Safely with Diabetes: Medical Guidance',
    'HbA1c Explained: What Your Test Results Mean',
    'Foot Care for Diabetics: Preventing Ulcers in Daily Life',
    'Insulin vs Oral Medicines: Understanding Your Treatment Plan',
    'Gestational Diabetes in Pakistani Women: Screening and Follow-Up',
    'Low-GI Pakistani Meals for Better Blood Sugar Control',
    'Hypoglycemia at Work or School: How to Respond Quickly',
    'Diabetes and Kidney Health: Early Signs to Watch For',
    'Community Support and Diabetes Education in Pakistan',
  ],
  'womens-health': [
    'PCOS in Pakistani Women: Diagnosis, Lifestyle, and Fertility',
    'Prenatal Care in the First Trimester: What to Expect',
    'Anemia and Iron Deficiency During Pregnancy',
    'Breast Self-Examination: A Step-by-Step Guide',
    'Menopause Symptoms and Hormonal Health After 45',
    'Urinary Tract Infections: Prevention and When to Treat',
    'Cervical Cancer Screening and HPV Awareness in Pakistan',
    'Postpartum Depression: Recognizing Signs and Seeking Help',
    'Contraception Options: An Evidence-Based Overview',
    'Thyroid Disorders in Women: Fatigue, Weight, and Mood Changes',
  ],
  'mens-health': [
    'Prostate Health Screening: What Men Over 50 Should Know',
    'Erectile Dysfunction and Cardiovascular Health Links',
    'Workplace Stress and Burnout Among Pakistani Professionals',
    'Testosterone Levels: Myths vs Medical Facts',
    'Colorectal Cancer Awareness and Early Detection',
    'Safe Weight Training and Joint Protection for Men',
    'Sleep Apnea, Snoring, and Daytime Fatigue',
    'Alcohol, Smoking, and Long-Term Health Risks',
    'Hair Loss and Scalp Health: Medical and Lifestyle Factors',
    'Annual Health Checkups Men Often Skip — and Should Not',
  ],
  'child-care': [
    'EPI Vaccination Schedule in Pakistan: What Parents Need to Know',
    'Managing Fever in Children at Home vs Visiting a Pediatrician',
    'Malnutrition and Stunting: Nutrition for Growing Children',
    'Hand, Foot, and Mouth Disease: Contagion and Care',
    'Screen Time Limits and Eye Health for Schoolchildren',
    'Asthma in Children: Triggers During Pollution Season',
    'Dehydration in Summer: ORS and When to Hospitalize',
    'Growth Milestones from Infancy to Adolescence',
    'School Lunch Ideas with Balanced Pakistani Nutrition',
    'ADHD and Learning Difficulties: Early Evaluation Matters',
  ],
  'mental-health': [
    'Anxiety in Young Adults: Coping Strategies That Work',
    'Depression Is a Medical Condition: Breaking Stigma in Pakistan',
    'Exam Stress and Academic Pressure: Support for Students',
    'When to Seek Therapy vs Psychiatry: Understanding the Difference',
    'Post-Traumatic Stress After Accidents or Disasters',
    'Mindfulness and Prayer: Complementary Approaches to Calm',
    'Sleep Hygiene for Better Mood and Concentration',
    'Social Media and Mental Health Among Pakistani Teens',
    'Burnout in Healthcare Workers and Caregivers',
    'Suicide Prevention: Warning Signs Families Should Not Ignore',
  ],
  nutrition: [
    'Balanced Desi Plate: Portion Control with Roti, Dal, and Sabzi',
    'Protein Sources for Vegetarians in Pakistani Diets',
    'Hidden Sugar in Chai, Desserts, and Packaged Snacks',
    'Iron-Rich Foods to Combat Anemia Naturally',
    'Healthy Iftar and Sehri Choices During Ramadan',
    'Hydration in Summer: Beyond Rooh Afza and Soft Drinks',
    'Micronutrient Deficiencies in Rural and Urban Pakistan',
    'Reading Food Labels on Local Packaged Products',
    'Weight Management Without Crash Diets or Unregulated Supplements',
    'Fiber Intake and Digestive Health with Traditional Meals',
  ],
  fitness: [
    'Walking 10,000 Steps in Pakistani Cities: Practical Tips',
    'Home Workouts Without Gym Equipment',
    'Exercise Safely During Lahore and Islamabad Smog Alerts',
    'Strength Training for Women: Benefits and Safety',
    'Yoga and Stretching for Desk Workers',
    'Sports Injuries in Cricket and Football: Prevention Basics',
    'Fitness After C-Section or Delivery: Gradual Return to Activity',
    'Hydration and Electrolytes During Outdoor Training',
    'Age-Appropriate Activity for Seniors in Pakistan',
    'Building Consistency: Habit Formation for Long-Term Fitness',
  ],
  'skin-care': [
    'Sun Protection in High-UV Climates: Sunscreen and Clothing',
    'Acne in Humid Weather: Skincare Routine for Pakistani Skin',
    'Eczema Flares in Winter: Moisturizing and Trigger Avoidance',
    'Melasma and Hyperpigmentation: Treatment Options Explained',
    'Fungal Infections in Monsoon Season: Prevention Tips',
    'When to See a Dermatologist vs Using Home Remedies',
    'Hair Fall and Scalp Dermatitis: Medical Evaluation',
    'Safe Use of Bleaching and Fairness Products',
    'Allergic Reactions to Henna and Cosmetic Products',
    'Wound Care and Scarring After Minor Injuries',
  ],
  'dental-care': [
    'Brushing and Flossing: Daily Habits for Strong Teeth',
    'Paan, Betel Nut, and Oral Cancer Risk Awareness',
    'Toothache at Night: Temporary Relief and Next Steps',
    'Orthodontics and Braces: What Parents Should Know',
    'Gum Disease and Bleeding Gums: Professional Cleaning Matters',
    'Dental Visits During Pregnancy: Safety and Timing',
    'Fluoride, Mouthwash, and Evidence-Based Oral Care',
    'Sports Mouthguards for Young Athletes',
    'Root Canal vs Extraction: Understanding Your Options',
    'Children’s First Dental Visit: Age and Preparation',
  ],
  'eye-care': [
    'Digital Eye Strain from Mobile and Laptop Use',
    'Cataract Surgery in Pakistan: What Patients Should Expect',
    'Diabetic Retinopathy Screening for Vision Protection',
    'Red Eye: Allergy, Infection, or Something Serious?',
    'Myopia in Schoolchildren: Glasses and Outdoor Time',
    'Glaucoma: The Silent Thief of Sight',
    'Safe Contact Lens Hygiene in Dusty Environments',
    'Color Blindness and Occupational Guidance',
    'Eye Injuries at Home and Workplace: First Aid',
    'When Blurred Vision Needs Urgent Ophthalmology Review',
  ],
  'infectious-diseases': [
    'Dengue Fever in Pakistan: Symptoms, Platelets, and Hospital Care',
    'Typhoid Prevention: Vaccines, Food Safety, and ORS',
    'Hepatitis B and C: Screening and Treatment Access',
    'COVID-19 Boosters and Respiratory Hygiene Updates',
    'Tuberculosis in Pakistan: Cough Duration and DOTS Therapy',
    'Malaria in Endemic Areas: Mosquito Control and Prophylaxis',
    'Cholera and Safe Drinking Water During Floods',
    'Measles Outbreaks: Vaccination and Isolation Guidance',
    'Hand Hygiene to Reduce Seasonal Flu Transmission',
    'Rabies After Dog Bites: Immediate Steps and PEP',
  ],
};

const CONTACT_SUBJECTS = [
  'Appointment booking assistance',
  'Doctor verification inquiry',
  'Partnership with hospitals',
  'Technical issue with video consultation',
  'Feedback on recent consultation',
  'Insurance and billing question',
  'Media and press inquiry',
  'Suggestion for new specialty doctors',
  'Account access problem',
  'General platform information',
];

const EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'icloud.com'];

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

function personName(index: number, female = index % 2 === 0): string {
  const first = female
    ? pick(PAKISTANI_FIRST_NAMES_FEMALE, index)
    : pick(PAKISTANI_FIRST_NAMES_MALE, index);
  const last = pick(PAKISTANI_LAST_NAMES, index + 7);
  return `${first} ${last}`;
}

function estimateReadTimeMinutes(content: string): number {
  const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(4, Math.min(18, Math.ceil(words / 200)));
}

function buildBlogContent(title: string, categoryName: string, index: number): string {
  const city = pick(PAKISTANI_CITIES, index).city;
  const hospital = pick(PAKISTANI_HOSPITALS, index);
  const intro = `Across ${city} and similar cities in Pakistan, ${title.charAt(0).toLowerCase()}${title.slice(1)} remains a common concern discussed in clinics, family WhatsApp groups, and community health camps. This article summarizes evidence-based guidance aligned with PMDC practice standards and public health recommendations relevant to Pakistani patients.`;
  const sections = [
    `<h2>Why This Matters in Pakistan</h2><p>South Asian populations face unique risk factors including dietary patterns rich in refined carbohydrates and salt, seasonal air pollution, and variable access to tertiary care. Understanding ${categoryName.toLowerCase()} helps families make timely decisions before complications develop.</p>`,
    `<h2>Common Signs and Symptoms</h2><p>Patients often delay care because symptoms feel mild or familiar. Watch for persistent changes lasting more than two weeks, sudden worsening, or red-flag features such as chest pain, confusion, high fever, or difficulty breathing. Early evaluation at a trusted facility like ${hospital} can improve outcomes.</p>`,
    `<h2>Prevention and Daily Habits</h2><ul><li>Maintain regular sleep, hydration, and balanced meals suited to local cuisine.</li><li>Follow vaccination and screening schedules recommended by your physician.</li><li>Limit self-medication with antibiotics or steroids without prescription.</li><li>Track blood pressure, weight, or glucose at home when advised.</li></ul>`,
    `<h2>Treatment and Follow-Up</h2><p>Treatment should be individualized after proper history, examination, and investigations. Telemedicine can support follow-up, but emergencies require in-person assessment. Always confirm diagnoses with qualified doctors rather than relying on unverified social media advice.</p>`,
    `<h2>When to Seek Urgent Care</h2><p>Visit the nearest emergency department if you experience severe pain, fainting, breathing difficulty, persistent vomiting, or neurological changes. Keep a list of current medicines and allergies ready for hospital staff.</p>`,
  ];
  return `<p>${intro}</p>${sections.join('')}`;
}

function buildExcerpt(title: string, categoryName: string, index: number): string {
  const city = pick(PAKISTANI_CITIES, index + 3).city;
  return `Expert ${categoryName.toLowerCase()} guidance for readers in ${city} and across Pakistan. Learn practical prevention, warning signs, and when to consult a qualified physician — ${title.split(':')[0]?.trim()}.`;
}

function buildTags(categorySlug: string, index: number): string[] {
  const baseTags: Record<string, string[]> = {
    'general-health': ['preventive care', 'primary care', 'Pakistan health', 'wellness'],
    'heart-health': ['hypertension', 'cardiology', 'heart disease', 'Pakistan'],
    diabetes: ['type 2 diabetes', 'blood sugar', 'HbA1c', 'South Asia'],
    'womens-health': ['women health', 'pregnancy', 'PCOS', 'Pakistan'],
    'mens-health': ['men health', 'prostate', 'screening', 'Pakistan'],
    'child-care': ['pediatrics', 'vaccination', 'EPI', 'child health'],
    'mental-health': ['anxiety', 'depression', 'mental wellness', 'stigma'],
    nutrition: ['diet', 'desi food', 'nutrition', 'Ramadan'],
    fitness: ['exercise', 'physical activity', 'home workout', 'fitness'],
    'skin-care': ['dermatology', 'skin care', 'acne', 'sun protection'],
    'dental-care': ['oral health', 'dentistry', 'teeth', 'gum disease'],
    'eye-care': ['ophthalmology', 'vision', 'eye strain', 'cataract'],
    'infectious-diseases': ['dengue', 'typhoid', 'infection', 'public health'],
  };
  const tags = [...(baseTags[categorySlug] ?? ['health', 'Pakistan'])];
  if (index % 4 === 0) tags.push('telemedicine');
  if (index % 5 === 0) tags.push('DrInsight');
  return Array.from(new Set(tags)).slice(0, 5);
}

function blogStatus(index: number): BlogStatus {
  if (index % 25 === 0) return BlogStatus.DRAFT;
  if (index % 17 === 0) return BlogStatus.ARCHIVED;
  return BlogStatus.PUBLISHED;
}

function publishedAt(index: number, status: BlogStatus): Date | null {
  if (status !== BlogStatus.PUBLISHED && status !== BlogStatus.ARCHIVED) return null;
  const date = new Date();
  date.setDate(date.getDate() - (index * 6 + (index % 30)));
  date.setHours(9 + (index % 8), (index * 11) % 60, 0, 0);
  return date;
}

export type BlogPostSeed = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  categorySlug: string;
  status: BlogStatus;
  readTimeMinutes: number;
  viewCount: number;
  tags: string[];
  publishedAt: Date | null;
};

export function buildBlogPosts(): BlogPostSeed[] {
  const posts: BlogPostSeed[] = [];
  const usedSlugs = new Set<string>();
  let index = 0;

  for (const category of BLOG_CATEGORIES) {
    const titles = BLOG_TITLE_TEMPLATES[category.slug] ?? [];
    for (const title of titles) {
      index += 1;
      let slug = slugify(title);
      if (usedSlugs.has(slug)) slug = `${slug}-${index}`;
      usedSlugs.add(slug);

      const content = buildBlogContent(title, category.name, index);
      const status = blogStatus(index);
      posts.push({
        title,
        slug,
        excerpt: buildExcerpt(title, category.name, index),
        content,
        coverImageUrl: pick(COVER_IMAGES[category.slug] ?? COVER_IMAGES['general-health'], index),
        categorySlug: category.slug,
        status,
        readTimeMinutes: estimateReadTimeMinutes(content),
        viewCount: 120 + (index * 137) % 4800,
        tags: buildTags(category.slug, index),
        publishedAt: publishedAt(index, status),
      });
    }
  }

  while (posts.length < BLOG_POST_COUNT) {
    index += 1;
    const category = pick(BLOG_CATEGORIES, index);
    const baseTitle = pick(BLOG_TITLE_TEMPLATES[category.slug] ?? BLOG_TITLE_TEMPLATES['general-health'], index);
    const city = pick(PAKISTANI_CITIES, index).city;
    const title = `${baseTitle} — A ${city} Perspective`;
    let slug = slugify(title);
    if (usedSlugs.has(slug)) slug = `${slug}-${index}`;
    usedSlugs.add(slug);

    const content = buildBlogContent(title, category.name, index);
    const status = blogStatus(index);
    posts.push({
      title,
      slug,
      excerpt: buildExcerpt(title, category.name, index),
      content,
      coverImageUrl: pick(COVER_IMAGES[category.slug] ?? COVER_IMAGES['general-health'], index),
      categorySlug: category.slug,
      status,
      readTimeMinutes: estimateReadTimeMinutes(content),
      viewCount: 120 + (index * 137) % 4800,
      tags: buildTags(category.slug, index),
      publishedAt: publishedAt(index, status),
    });
  }

  return posts.slice(0, BLOG_POST_COUNT);
}

const QUESTION_TEMPLATES: Array<{
  category: string;
  question: (name: string, city: string, age: number) => string;
  answer: (doctorLastName: string, specialty: string) => string;
}> = [
  {
    category: 'Cardiology',
    question: (name, city, age) =>
      `Assalam o Alaikum, my name is ${name} from ${city}. I am ${age} years old and have been feeling chest tightness when climbing stairs for two weeks. My father had a heart attack at 55. Should I visit a cardiologist urgently or wait?`,
    answer: (doctor, specialty) =>
      `Wa Alaikum Assalam. Given your symptoms and family history, please arrange an ECG and clinical review within 24–48 hours rather than waiting. A ${specialty.toLowerCase()} specialist can assess blood pressure, lipids, and risk factors. If chest pain becomes severe, radiates to the arm or jaw, or occurs at rest, go to the nearest emergency department immediately. — Dr. ${doctor}`,
  },
  {
    category: 'Dermatology',
    question: (name, city, age) =>
      `Hello doctor, I am ${name}, ${age}, living in ${city}. Red itchy patches appeared on my arms during humid weather and OTC creams only help briefly. Could this be eczema or a fungal infection?`,
    answer: (doctor, specialty) =>
      `Thank you for your question. Both eczema and fungal infections are common in humid climates. Avoid repeated steroid creams without diagnosis. A ${specialty.toLowerCase()} examination with possible skin scraping can confirm the cause and guide antifungal or barrier-repair treatment. Keep areas dry and wear loose cotton clothing. — Dr. ${doctor}`,
  },
  {
    category: 'Pediatrics',
    question: (name, city, age) =>
      `Doctor sahab, ${name} here from ${city}. My 3-year-old has had fever for two days (101–102°F) and is drinking fluids but less active. When should I take him to the hospital instead of managing at home?`,
    answer: (doctor, specialty) =>
      `For a toddler with fever, seek urgent care if you notice breathing difficulty, persistent vomiting, rash with fever, lethargy, dehydration signs, or fever above 104°F. Otherwise, continue fluids, sponging, and age-appropriate antipyretics after dosing confirmation. A ${specialty.toLowerCase()} visit within 48 hours is reasonable if fever persists. — Dr. ${doctor}`,
  },
  {
    category: 'Gynecology',
    question: (name, city, age) =>
      `Salam, I am ${name}, ${age}, from ${city}. My periods have become irregular and I was told I may have PCOS. Can I manage this with diet alone or do I need long-term medication?`,
    answer: (doctor, specialty) =>
      `PCOS management is individualized. Lifestyle changes including weight optimization, regular exercise, and balanced meals are first-line and often improve cycles. However, many patients also need metformin or hormonal therapy depending on fertility goals and lab results. Please follow up with a ${specialty.toLowerCase()} specialist for ultrasound and hormone testing. — Dr. ${doctor}`,
  },
  {
    category: 'Psychiatry',
    question: (name, city, age) =>
      `Anonymous patient from ${city}, age ${age}. I feel constant worry, poor sleep, and loss of interest in daily activities for three months. Is this depression and is therapy available in Pakistan?`,
    answer: (doctor, specialty) =>
      `Your symptoms are consistent with an anxiety or depressive disorder, which is treatable. Please consult a qualified ${specialty.toLowerCase()} professional for structured assessment. Therapy, lifestyle changes, and medication when indicated are all valid options. If you have thoughts of self-harm, contact a local helpline or emergency services immediately. — Dr. ${doctor}`,
  },
  {
    category: 'Endocrinology',
    question: (name, city, age) =>
      `Doctor, ${name} from ${city}, ${age} years. My fasting sugar is 145 and HbA1c 7.8. My GP started metformin. What diet changes suit Pakistani meals?`,
    answer: (doctor, specialty) =>
      `Focus on portion-controlled roti, high-fiber dal and vegetables, grilled protein, and reduced sugary chai and desserts. Walk 30 minutes daily if medically cleared. Repeat HbA1c in three months. A ${specialty.toLowerCase()} follow-up helps adjust medicines and screen for complications. — Dr. ${doctor}`,
  },
  {
    category: 'ENT',
    question: (name, city, age) =>
      `Hi, ${name} here, ${city}. Chronic blocked nose and post-nasal drip for months, worse in smog season. Could this be allergy or sinus infection?`,
    answer: (doctor, specialty) =>
      `Persistent symptoms during pollution season often reflect allergic rhinitis with or without sinus involvement. Saline rinses, allergen avoidance, and evaluated use of nasal sprays help many patients. An ${specialty.toLowerCase()} review can assess for polyps or chronic sinusitis if symptoms persist despite initial treatment. — Dr. ${doctor}`,
  },
  {
    category: 'Ophthalmology',
    question: (name, city, age) =>
      `Assalam o Alaikum, I am ${name} from ${city}, ${age}. Blurred vision and floaters increased over a week. I am diabetic. How urgent is an eye check?`,
    answer: (doctor, specialty) =>
      `Sudden increase in floaters or blurred vision in a diabetic patient warrants prompt dilated eye examination to rule out retinopathy or retinal detachment. Please schedule an ${specialty.toLowerCase()} appointment within days, or seek emergency care if vision loss is rapid or painless curtain-like defect appears. — Dr. ${doctor}`,
  },
  {
    category: 'Gastroenterology',
    question: (name, city, age) =>
      `Doctor, ${name} from ${city}. Burning chest after spicy food and late dinners for months. Antacids give temporary relief. Could this be GERD?`,
    answer: (doctor, specialty) =>
      `Your description fits gastroesophageal reflux disease, but persistent symptoms should be evaluated to exclude other causes. Elevate head during sleep, avoid late heavy meals, and reduce trigger foods. A ${specialty.toLowerCase()} specialist may recommend endoscopy if symptoms persist beyond four to eight weeks of optimized therapy. — Dr. ${doctor}`,
  },
  {
    category: 'General Medicine',
    question: (name, city, age) =>
      `Salam doctor, ${name}, ${age}, ${city}. Low-grade fever on and off for 10 days with fatigue. Malaria test was negative. What else should be checked?`,
    answer: (doctor, specialty) =>
      `Prolonged fever warrants CBC, liver function, urinalysis, and targeted tests based on exposure history including typhoid and viral panels. Avoid repeated antibiotics without diagnosis. Please visit a ${specialty.toLowerCase()} physician for systematic evaluation and hydration monitoring. — Dr. ${doctor}`,
  },
  {
    category: 'Orthopedics',
    question: (name, city, age) =>
      `Hello, ${name} from ${city}, age ${age}. Knee pain when using stairs after cricket injury last month. Swelling comes and goes. Do I need an MRI?`,
    answer: (doctor, specialty) =>
      `Persistent knee pain after sports injury may involve ligament or meniscus injury. Clinical examination comes first; MRI is considered if mechanical locking, instability, or failure of conservative therapy occurs. Rest, ice, compression, and physiotherapy are initial steps. An ${specialty.toLowerCase()} review is recommended. — Dr. ${doctor}`,
  },
  {
    category: 'Pulmonology',
    question: (name, city, age) =>
      `Doctor sahab, ${name}, ${city}. I cough daily in winter and wheeze at night. Could this be asthma despite never being diagnosed as a child?`,
    answer: (doctor, specialty) =>
      `Adult-onset asthma is possible, especially with allergy history or smoke exposure. Spirometry with reversibility testing confirms diagnosis. Please see a ${specialty.toLowerCase()} specialist for inhaler therapy and trigger control, including indoor smoke and outdoor pollution exposure. — Dr. ${doctor}`,
  },
  {
    category: 'Nephrology',
    question: (name, city, age) =>
      `Assalam o Alaikum, ${name} from ${city}, ${age}. My creatinine came back slightly high on routine tests. I take painkillers occasionally. Should I be worried?`,
    answer: (doctor, specialty) =>
      `Even mild creatinine elevation should be repeated after hydration and review of medicines including NSAIDs. A ${specialty.toLowerCase()} assessment checks urine protein, blood pressure, and underlying diabetes or hypertension. Avoid nephrotoxic drugs until cleared by your physician. — Dr. ${doctor}`,
  },
  {
    category: 'Urology',
    question: (name, city, age) =>
      `Doctor, ${name}, ${age}, from ${city}. Frequent urination at night and weak stream. Is this prostate-related at my age?`,
    answer: (doctor, specialty) =>
      `Lower urinary tract symptoms in men can relate to benign prostatic enlargement but require examination and PSA discussion based on age and risk. A ${specialty.toLowerCase()} visit helps differentiate infection, obstruction, and other causes. Seek urgent care if unable to urinate or visible blood appears. — Dr. ${doctor}`,
  },
  {
    category: 'Family Medicine',
    question: (name, city, age) =>
      `Hi doctor, ${name} in ${city}, ${age}. Which vaccines do adults in Pakistan commonly miss during routine life?`,
    answer: (doctor, specialty) =>
      `Adults often miss tetanus boosters, hepatitis B, influenza, pneumococcal (especially over 65 or with chronic illness), and COVID boosters when indicated. A ${specialty.toLowerCase()} physician can tailor schedules to travel, pregnancy, and chronic conditions. Keep a written vaccination record. — Dr. ${doctor}`,
  },
];

export type AskDoctorQuestionSeed = {
  category: string;
  question: string;
  answer: string | null;
  submitterName: string | null;
  isAnonymous: boolean;
  status: QuestionStatus;
  answeredAt: Date | null;
  doctorIndex: number | null;
};

export function buildAskDoctorQuestions(): AskDoctorQuestionSeed[] {
  const questions: AskDoctorQuestionSeed[] = [];

  for (let i = 1; i <= ASK_DOCTOR_COUNT; i++) {
    const template = pick(QUESTION_TEMPLATES, i);
    const city = pick(PAKISTANI_CITIES, i).city;
    const age = 18 + (i % 52);
    const isAnonymous = i % 9 === 0;
    const name = personName(i, i % 3 === 0);
    const answered = i % 5 !== 0 && i % 7 !== 0;
    const status = answered ? QuestionStatus.ANSWERED : i % 11 === 0 ? QuestionStatus.REJECTED : QuestionStatus.PENDING;
    const doctorIndex = status === QuestionStatus.ANSWERED ? i % 50 : null;
    const doctorLastName = pick(PAKISTANI_LAST_NAMES, i + 20);
    const specialtyInfo = pick(MEDICAL_SPECIALTIES, i);

    const answeredAt =
      status === QuestionStatus.ANSWERED
        ? (() => {
            const date = new Date();
            date.setDate(date.getDate() - (i % 60));
            date.setHours(10 + (i % 6), (i * 7) % 60, 0, 0);
            return date;
          })()
        : null;

    questions.push({
      category: template.category,
      question: template.question(name, city, age),
      answer:
        status === QuestionStatus.ANSWERED
          ? template.answer(doctorLastName, specialtyInfo.specialty)
          : null,
      submitterName: isAnonymous ? null : name,
      isAnonymous,
      status,
      answeredAt,
      doctorIndex,
    });
  }

  return questions;
}

export function buildNewsletterEmails(): string[] {
  const emails = new Set<string>();
  let index = 0;

  while (emails.size < NEWSLETTER_COUNT) {
    index += 1;
    const female = index % 2 === 0;
    const first = (female ? pick(PAKISTANI_FIRST_NAMES_FEMALE, index) : pick(PAKISTANI_FIRST_NAMES_MALE, index))
      .toLowerCase()
      .replace(/[^a-z]/g, '');
    const last = pick(PAKISTANI_LAST_NAMES, index).toLowerCase().replace(/[^a-z]/g, '');
    const domain = pick(EMAIL_DOMAINS, index);
    const email = `${first}.${last}${index}@${domain}`;
    emails.add(email);
  }

  return Array.from(emails);
}

function contactMessage(index: number, name: string, city: string): string {
  const templates = [
    `Salam, my name is ${name} from ${city}. I would like help booking a video consultation with a cardiologist on your platform. Please guide me on available slots this week.`,
    `Hello DrInsight team, I am ${name} based in ${city}. Our clinic is interested in partnering for telemedicine referrals. Kindly share onboarding details for healthcare providers.`,
    `Dear support, this is ${name}. I completed payment but the appointment confirmation email did not arrive. My registered number ends with ${String(1000 + (index % 9000)).slice(-4)}.`,
    `Hi, ${name} here from ${city}. The mobile site logs me out frequently during chat consultations. Could your technical team investigate this issue?`,
    `Assalam o Alaikum, I am ${name}. I want to appreciate Dr. on your platform for a professional consultation, and also ask how to download my prescription PDF again.`,
    `Hello, ${name} from ${city}. Does DrInsight accept Sehat Sahulat or private insurance for specialist appointments? Please clarify the billing process.`,
    `Dear team, ${name} writing from ${city}. I am a medical student and would like to contribute guest articles to your health blog. Who should I contact?`,
    `Salam, this is ${name}. I forgot my password and the reset link expired twice. Please advise on account recovery steps.`,
    `Hi DrInsight, ${name} from ${city}. Can you add more dermatologists who speak Saraiki or Balochi for patients from interior Sindh and Balochistan?`,
    `Hello, my name is ${name}. I have a general question about data privacy and how my medical records are stored on your servers in Pakistan.`,
  ];
  return pick(templates, index);
}

export type ContactSubmissionSeed = {
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
};

export function buildContactSubmissions(): ContactSubmissionSeed[] {
  const submissions: ContactSubmissionSeed[] = [];

  for (let i = 1; i <= CONTACT_COUNT; i++) {
    const female = i % 3 === 0;
    const first = female ? pick(PAKISTANI_FIRST_NAMES_FEMALE, i) : pick(PAKISTANI_FIRST_NAMES_MALE, i);
    const last = pick(PAKISTANI_LAST_NAMES, i + 2);
    const name = `${first} ${last}`;
    const city = pick(PAKISTANI_CITIES, i).city;
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - (i % 90));
    createdAt.setHours(8 + (i % 10), (i * 13) % 60, 0, 0);

    submissions.push({
      name,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@${SEED_DOMAIN}`,
      subject: pick(CONTACT_SUBJECTS, i),
      message: contactMessage(i, name, city),
      isRead: i % 4 === 0,
      createdAt,
    });
  }

  return submissions;
}
