import { DoctorAvailability, UserRole, UserStatus } from '@prisma/client';

export const SEED_PASSWORD = 'Password123!';
export const SEED_DOMAIN = 'drinsight.pk';

export const ADMIN_COUNT = 5;
export const DOCTOR_COUNT = 50;
export const PATIENT_COUNT = 200;

export const LEGACY_DEMO_EMAILS = [
  'admin@drinsight.com',
  'doctor@drinsight.com',
  'patient@drinsight.com',
] as const;

export const PAKISTANI_FIRST_NAMES_MALE = [
  'Ahmed',
  'Ali',
  'Hassan',
  'Usman',
  'Bilal',
  'Imran',
  'Faisal',
  'Kamran',
  'Tariq',
  'Nadeem',
  'Shahid',
  'Waqar',
  'Asad',
  'Hamza',
  'Omar',
  'Zain',
  'Saad',
  'Rashid',
  'Farhan',
  'Adnan',
  'Arslan',
  'Danish',
  'Fahad',
  'Haris',
  'Irfan',
  'Junaid',
  'Kashif',
  'Luqman',
  'Mansoor',
  'Naveed',
  'Qasim',
  'Rizwan',
  'Salman',
  'Talha',
  'Umer',
  'Waseem',
  'Yasir',
  'Zeeshan',
  'Aamir',
  'Babar',
  'Ehtisham',
  'Ghulam',
  'Haider',
  'Javed',
  'Khurram',
  'Latif',
  'Mehmood',
  'Noman',
  'Parvez',
  'Raheel',
];

export const PAKISTANI_FIRST_NAMES_FEMALE = [
  'Ayesha',
  'Fatima',
  'Sana',
  'Hina',
  'Nadia',
  'Sadia',
  'Maria',
  'Rabia',
  'Amna',
  'Zara',
  'Saima',
  'Nida',
  'Kiran',
  'Samina',
  'Shazia',
  'Bushra',
  'Farah',
  'Ghazala',
  'Huma',
  'Iqra',
  'Javeria',
  'Khadija',
  'Laiba',
  'Mahnoor',
  'Naila',
  'Omaima',
  'Palwasha',
  'Qurat',
  'Rukhsana',
  'Saba',
  'Tahira',
  'Uzma',
  'Wajiha',
  'Yasmeen',
  'Zainab',
  'Aleena',
  'Bisma',
  'Daniya',
  'Eman',
  'Fiza',
  'Hafsa',
  'Inaya',
  'Jannat',
  'Kinza',
  'Lubna',
  'Mehwish',
  'Noreen',
  'Rimsha',
  'Sundas',
  'Tehmina',
];

export const PAKISTANI_LAST_NAMES = [
  'Khan',
  'Ahmed',
  'Malik',
  'Hussain',
  'Ali',
  'Sheikh',
  'Raza',
  'Iqbal',
  'Butt',
  'Chaudhry',
  'Mirza',
  'Siddiqui',
  'Qureshi',
  'Hashmi',
  'Baig',
  'Ansari',
  'Mahmood',
  'Akhtar',
  'Rashid',
  'Yousaf',
  'Abbasi',
  'Baloch',
  'Khattak',
  'Memon',
  'Soomro',
  'Bhatti',
  'Rajput',
  'Arif',
  'Javed',
  'Nawaz',
];

export const PAKISTANI_CITIES = [
  { city: 'Karachi', province: 'Sindh', code: 'SD' },
  { city: 'Lahore', province: 'Punjab', code: 'PB' },
  { city: 'Islamabad', province: 'Islamabad', code: 'IS' },
  { city: 'Rawalpindi', province: 'Punjab', code: 'PB' },
  { city: 'Peshawar', province: 'KPK', code: 'KP' },
  { city: 'Quetta', province: 'Balochistan', code: 'BL' },
  { city: 'Multan', province: 'Punjab', code: 'PB' },
  { city: 'Faisalabad', province: 'Punjab', code: 'PB' },
  { city: 'Hyderabad', province: 'Sindh', code: 'SD' },
  { city: 'Sialkot', province: 'Punjab', code: 'PB' },
  { city: 'Gujranwala', province: 'Punjab', code: 'PB' },
  { city: 'Abbottabad', province: 'KPK', code: 'KP' },
  { city: 'Sukkur', province: 'Sindh', code: 'SD' },
  { city: 'Mardan', province: 'KPK', code: 'KP' },
  { city: 'Bahawalpur', province: 'Punjab', code: 'PB' },
];

export const PAKISTANI_HOSPITALS = [
  'Aga Khan University Hospital, Karachi',
  'Shaukat Khanum Memorial Cancer Hospital, Lahore',
  'Jinnah Postgraduate Medical Centre, Karachi',
  'Mayo Hospital, Lahore',
  'Pakistan Institute of Medical Sciences, Islamabad',
  'Combined Military Hospital, Rawalpindi',
  'Lady Reading Hospital, Peshawar',
  'Civil Hospital Karachi',
  'Services Hospital, Lahore',
  'Sandeman Provincial Hospital, Quetta',
  'Nishtar Hospital, Multan',
  'Allied Hospital, Faisalabad',
  'Liaquat University Hospital, Hyderabad',
  'Holy Family Hospital, Rawalpindi',
  'Khyber Teaching Hospital, Peshawar',
  'Bolani Medical Complex, Quetta',
  'Indus Hospital, Karachi',
  'Fatima Memorial Hospital, Lahore',
  'Shifa International Hospital, Islamabad',
  'Dow University Hospital, Karachi',
];

export const PAKISTANI_MEDICAL_UNIVERSITIES = [
  'King Edward Medical University, Lahore',
  'Dow University of Health Sciences, Karachi',
  'Aga Khan University, Karachi',
  'Rawalpindi Medical University',
  'Khyber Medical University, Peshawar',
  'Bolani University of Medical Sciences, Quetta',
  'Liaquat University of Medical & Health Sciences, Jamshoro',
  'University of Health Sciences, Lahore',
  'Ziauddin University, Karachi',
  'Islamabad Medical and Dental College',
  'Army Medical College, Rawalpindi',
  'Jinnah Sindh Medical University, Karachi',
  'KMU Institute of Medical Sciences, Kohat',
  'Shaikh Khalifa Bin Zayed Al-Nahyan Medical College, Lahore',
  'Faisalabad Medical University',
];

export const MEDICAL_SPECIALTIES: Array<{
  specialty: string;
  subSpecialties: string[];
}> = [
  { specialty: 'Cardiology', subSpecialties: ['Interventional Cardiology', 'Electrophysiology', 'Pediatric Cardiology'] },
  { specialty: 'Dermatology', subSpecialties: ['Cosmetic Dermatology', 'Pediatric Dermatology', 'Dermatopathology'] },
  { specialty: 'Neurology', subSpecialties: ['Stroke Medicine', 'Epilepsy', 'Movement Disorders'] },
  { specialty: 'Orthopedics', subSpecialties: ['Sports Medicine', 'Spine Surgery', 'Joint Replacement'] },
  { specialty: 'Pediatrics', subSpecialties: ['Neonatology', 'Pediatric Neurology', 'Pediatric Cardiology'] },
  { specialty: 'Gynecology', subSpecialties: ['Obstetrics', 'Reproductive Endocrinology', 'Maternal-Fetal Medicine'] },
  { specialty: 'General Medicine', subSpecialties: ['Diabetology', 'Hypertension', 'Infectious Diseases'] },
  { specialty: 'Psychiatry', subSpecialties: ['Child Psychiatry', 'Addiction Psychiatry', 'Geriatric Psychiatry'] },
  { specialty: 'ENT', subSpecialties: ['Otology', 'Rhinology', 'Head & Neck Surgery'] },
  { specialty: 'Ophthalmology', subSpecialties: ['Retina', 'Glaucoma', 'Pediatric Ophthalmology'] },
  { specialty: 'Urology', subSpecialties: ['Andrology', 'Pediatric Urology', 'Urologic Oncology'] },
  { specialty: 'Gastroenterology', subSpecialties: ['Hepatology', 'Inflammatory Bowel Disease', 'Endoscopy'] },
  { specialty: 'Pulmonology', subSpecialties: ['Sleep Medicine', 'Critical Care', 'Interventional Pulmonology'] },
  { specialty: 'Nephrology', subSpecialties: ['Dialysis', 'Transplant Nephrology', 'Hypertension Nephrology'] },
  { specialty: 'Endocrinology', subSpecialties: ['Diabetes', 'Thyroid Disorders', 'Metabolic Medicine'] },
  { specialty: 'Oncology', subSpecialties: ['Medical Oncology', 'Radiation Oncology', 'Hematology'] },
  { specialty: 'Rheumatology', subSpecialties: ['Autoimmune Disorders', 'Arthritis Care', 'Osteoporosis'] },
  { specialty: 'General Surgery', subSpecialties: ['Laparoscopic Surgery', 'Breast Surgery', 'Trauma Surgery'] },
  { specialty: 'Plastic Surgery', subSpecialties: ['Reconstructive Surgery', 'Burn Care', 'Hand Surgery'] },
  { specialty: 'Family Medicine', subSpecialties: ['Primary Care', 'Geriatric Care', 'Preventive Medicine'] },
];

export const ALL_PAKISTANI_LANGUAGES = [
  'Urdu',
  'English',
  'Punjabi',
  'Sindhi',
  'Pashto',
  'Balochi',
  'Saraiki',
] as const;

export const COMMON_ALLERGIES = [
  'Penicillin',
  'Aspirin',
  'Sulfa drugs',
  'Dust mites',
  'Pollen',
  'Peanuts',
  'Shellfish',
  'Latex',
  'Ibuprofen',
  'Egg',
  'Milk',
  'Wheat',
  'Insect stings',
  'Mold',
  'NSAIDs',
];

export const MEDICAL_HISTORY_SNIPPETS = [
  'Type 2 diabetes diagnosed in 2018, managed with metformin and diet.',
  'Essential hypertension on amlodipine since 2020.',
  'History of seasonal allergic rhinitis and mild asthma.',
  'Previous appendectomy in 2015, no complications.',
  'Chronic lower back pain related to desk work, physiotherapy ongoing.',
  'Hypothyroidism on levothyroxine, last TSH within normal range.',
  'Family history of coronary artery disease; patient is a non-smoker.',
  'Recurrent urinary tract infections, last episode treated six months ago.',
  'Migraine with aura, triggers include dehydration and stress.',
  'Gastroesophageal reflux disease managed with PPI therapy.',
  'Iron deficiency anemia corrected with supplementation in 2022.',
  'Childhood history of chickenpox; no chronic cardiac conditions.',
  'Mild osteoarthritis of knees, worsened during winter months.',
  'History of dengue fever in 2019 with full recovery.',
  'Gestational diabetes during prior pregnancy, resolved postpartum.',
  'Chronic hepatitis B carrier, on regular monitoring with hepatology.',
  'Vitamin D deficiency treated with weekly supplementation.',
  'No major surgeries; history of typhoid treated in adolescence.',
  'Anxiety disorder managed with counseling and lifestyle changes.',
  'Recovered from COVID-19 in 2021; no long-term pulmonary sequelae.',
];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export const GENDERS = ['Male', 'Female'] as const;

export function pick<T>(items: readonly T[], index: number): T {
  return items[index % items.length]!;
}

export function pickMany<T>(items: readonly T[], count: number, seed: number): T[] {
  const result: T[] = [];
  for (let i = 0; i < count; i++) {
    result.push(items[(seed + i) % items.length]!);
  }
  return Array.from(new Set(result));
}

export function seedEmail(role: UserRole, index: number): string {
  const prefix =
    role === UserRole.ADMIN ? 'admin' : role === UserRole.DOCTOR ? 'doctor' : 'patient';
  return `${prefix}${index}@${SEED_DOMAIN}`;
}

export function pakistaniPhone(seed: number): string {
  const prefixes = ['300', '301', '302', '303', '304', '305', '306', '307', '308', '309', '310', '311', '312', '313', '314', '315', '316', '317', '318', '319', '320', '321', '322', '323', '324', '325', '330', '331', '332', '333', '334', '335', '336', '337', '340', '341', '342', '343', '344', '345', '346', '347', '348', '349'];
  const prefix = pick(prefixes, seed);
  const suffix = String(1000000 + ((seed * 7919) % 9000000)).slice(-7);
  return `+92${prefix}${suffix}`;
}

export function pmdcLicenseNumber(index: number, provinceCode: string): string {
  const serial = String(10000 + index).padStart(5, '0');
  return `PMDC-${provinceCode}-${serial}`;
}

export function avatarUrl(firstName: string, lastName: string): string {
  const name = encodeURIComponent(`${firstName}+${lastName}`);
  return `https://ui-avatars.com/api/?name=${name}&background=0D8ABC&color=fff&size=256`;
}

export function consultationFeePkr(seed: number): number {
  const fees = [1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000];
  return pick(fees, seed);
}

export function doctorBio(
  firstName: string,
  lastName: string,
  specialty: string,
  city: string,
  experienceYears: number,
  hospital: string,
): string {
  return `Dr. ${firstName} ${lastName} is a board-certified ${specialty.toLowerCase()} specialist at ${hospital} with ${experienceYears} years of clinical experience. Based in ${city}, Dr. ${lastName} provides evidence-based care through in-person and telemedicine consultations and is recognised for patient-centred, guideline-driven practice.`;
}

export function doctorBioFull(
  firstName: string,
  lastName: string,
  specialty: string,
  city: string,
  experienceYears: number,
  hospital: string,
  university: string,
  subSpecialty: string,
): string {
  return [
    `Dr. ${lastName}'s passion for ${specialty.toLowerCase()} developed during medical training, when early specialist intervention transformed patient outcomes. After graduating from ${university}, Dr. ${lastName} completed postgraduate training and fellowship work focused on ${subSpecialty.toLowerCase()}.`,
    `Clinical philosophy centres on a patient-first, evidence-led approach — complex conditions are best managed through rigorous science, compassionate communication, and shared decision-making with patients and families.`,
    `At ${hospital} in ${city}, Dr. ${lastName} leads outpatient and telemedicine clinics, mentors junior clinicians, and contributes peer-reviewed educational content for DrInsight. Over ${experienceYears} years in practice, the focus remains accessible, high-quality care aligned with PMDC standards.`,
    `Beyond clinical work, Dr. ${lastName} is committed to community health education and continuing medical education for colleagues across Pakistan.`,
  ].join('\n\n');
}

export type EducationHistoryItem = {
  year: string;
  title: string;
  institution: string;
  icon: string;
};

export type CertificationItem = {
  title: string;
  subtitle: string;
  icon: string;
};

export type PublicationItem = {
  journal: string;
  title: string;
  year: number;
  citations: number;
  doi?: string;
  pubmedUrl?: string;
};

export type AwardItem = {
  title: string;
  organization: string;
  year: string;
  icon: string;
};

export type SpeakingItem = {
  title: string;
  venue: string;
  type: 'conference' | 'lecture' | 'webinar';
  year: string;
};

export type ScheduleDay = {
  day: string;
  time: string;
  available: boolean;
};

const SPECIALTY_EXPERTISE: Record<string, string[]> = {
  Cardiology: ['Interventional Cardiology', 'Heart Failure', 'Hypertension', 'Preventive Cardiology', 'ECG Interpretation', 'Coronary Artery Disease'],
  Dermatology: ['Acne & Rosacea', 'Psoriasis', 'Cosmetic Dermatology', 'Skin Cancer Screening', 'Pediatric Dermatology', 'Hair Disorders'],
  Neurology: ['Headache Medicine', 'Stroke Medicine', 'Epilepsy', 'Movement Disorders', 'Neuro-Oncology', 'Medication Overuse Headache'],
  Orthopedics: ['Sports Medicine', 'Joint Replacement', 'Spine Surgery', 'Fracture Care', 'Arthroscopy', 'Trauma Orthopedics'],
  Pediatrics: ['Neonatology', 'Childhood Immunisation', 'Growth & Development', 'Pediatric Infectious Disease', 'Asthma in Children', 'Nutrition'],
  Gynecology: ['Obstetrics', 'Reproductive Endocrinology', 'High-Risk Pregnancy', 'Menstrual Disorders', 'Family Planning', 'Menopause Care'],
  'General Medicine': ['Diabetology', 'Hypertension', 'Infectious Diseases', 'Preventive Medicine', 'Metabolic Syndrome', 'Primary Care'],
  Psychiatry: ['Anxiety Disorders', 'Depression', 'Child Psychiatry', 'Addiction Psychiatry', 'Sleep Disorders', 'Cognitive Behavioural Therapy'],
  ENT: ['Otology', 'Rhinology', 'Sinus Disease', 'Hearing Loss', 'Tonsil & Adenoid Care', 'Head & Neck Surgery'],
  Ophthalmology: ['Cataract Surgery', 'Glaucoma', 'Retina', 'Pediatric Ophthalmology', 'Refractive Errors', 'Diabetic Eye Disease'],
  Urology: ['Kidney Stones', 'Prostate Health', 'Andrology', 'Urinary Tract Infections', 'Urologic Oncology', 'Pediatric Urology'],
  Gastroenterology: ['Hepatology', 'IBD', 'Endoscopy', 'GERD', 'Peptic Ulcer Disease', 'Liver Disease'],
  Pulmonology: ['Asthma', 'COPD', 'Sleep Medicine', 'Critical Care', 'Tuberculosis', 'Interstitial Lung Disease'],
  Nephrology: ['Chronic Kidney Disease', 'Dialysis', 'Hypertension Nephrology', 'Electrolyte Disorders', 'Transplant Nephrology', 'AKI'],
  Endocrinology: ['Diabetes', 'Thyroid Disorders', 'Metabolic Medicine', 'Osteoporosis', 'Obesity Medicine', 'Adrenal Disorders'],
  Oncology: ['Medical Oncology', 'Chemotherapy', 'Cancer Screening', 'Palliative Care', 'Hematologic Malignancies', 'Immunotherapy'],
  Rheumatology: ['Rheumatoid Arthritis', 'Lupus', 'Osteoporosis', 'Gout', 'Autoimmune Disorders', 'Vasculitis'],
  'General Surgery': ['Laparoscopic Surgery', 'Hernia Repair', 'Gallbladder Surgery', 'Trauma Surgery', 'Breast Surgery', 'Appendectomy'],
  'Plastic Surgery': ['Reconstructive Surgery', 'Burn Care', 'Hand Surgery', 'Cosmetic Procedures', 'Wound Care', 'Scar Revision'],
  'Family Medicine': ['Primary Care', 'Geriatric Care', 'Preventive Medicine', 'Chronic Disease Management', 'Health Screening', 'Vaccination'],
};

export function buildDoctorBioProfile(input: {
  index: number;
  firstName: string;
  lastName: string;
  specialty: string;
  subSpecialty: string;
  city: string;
  hospital: string;
  university: string;
  experienceYears: number;
  licenseNumber: string;
  gender: string;
}) {
  const {
    index: i,
    firstName,
    lastName,
    specialty,
    subSpecialty,
    city,
    hospital,
    university,
    experienceYears,
    licenseNumber,
    gender,
  } = input;

  const gradYear = new Date().getFullYear() - experienceYears - 6;
  const mdYear = gradYear + 3;
  const fellowshipYear = mdYear + 2;
  const boardYear = fellowshipYear + 1;

  const expertiseBase = SPECIALTY_EXPERTISE[specialty] ?? [
    specialty,
    subSpecialty,
    'Evidence-Based Medicine',
    'Patient Education',
    'Telemedicine',
    'Chronic Disease Management',
  ];
  const expertise = [...new Set([subSpecialty, ...expertiseBase])].slice(0, 10);

  const educationHistory: EducationHistoryItem[] = [
    {
      year: String(gradYear),
      title: 'MBBS — Medicine & Surgery',
      institution: `${university} · First Class Honours`,
      icon: '🎓',
    },
    {
      year: String(mdYear),
      title: `FCPS — ${specialty}`,
      institution: `College of Physicians & Surgeons Pakistan · ${city}`,
      icon: '🏥',
    },
    {
      year: String(fellowshipYear),
      title: `Fellowship — ${subSpecialty}`,
      institution: hospital,
      icon: '🔬',
    },
    {
      year: String(boardYear),
      title: 'PMDC Registration & Specialist Recognition',
      institution: `Pakistan Medical & Dental Council · ${licenseNumber}`,
      icon: '📋',
    },
  ];

  const certifications: CertificationItem[] = [
    {
      title: 'College of Physicians & Surgeons Pakistan (CPSP)',
      subtitle: `FCPS (${specialty}) · ${mdYear}`,
      icon: '🏥',
    },
    {
      title: 'Pakistan Medical & Dental Council',
      subtitle: `Active License · ${licenseNumber}`,
      icon: '✓',
    },
    {
      title: `${specialty} Society of Pakistan`,
      subtitle: `Fellow Member · ${boardYear}–present`,
      icon: '🧠',
    },
    {
      title: 'Pakistan Medical Association',
      subtitle: `Member · ${gradYear + 1}–present`,
      icon: '🌍',
    },
  ];

  const publications: PublicationItem[] = [
    {
      journal: `Journal of ${specialty} Practice · ${boardYear + 4}`,
      title: `Clinical Outcomes in ${subSpecialty}: A Multi-Centre Observational Study from Pakistan`,
      year: boardYear + 4,
      citations: 20 + (i % 80),
      doi: `10.1000/j.${specialty.toLowerCase().replace(/\s+/g, '')}.${boardYear + 4}.${1000 + i}`,
    },
    {
      journal: `Pakistan Journal of Medical Sciences · ${boardYear + 2}`,
      title: `Evidence-Based Approaches to ${expertise[0]} in Outpatient Settings`,
      year: boardYear + 2,
      citations: 12 + (i % 50),
      doi: `10.12669/pjms.${boardYear + 2}.${2000 + i}`,
    },
    {
      journal: `South Asian Medical Review · ${boardYear}`,
      title: `Telemedicine Delivery of ${specialty} Care: Lessons from ${city}`,
      year: boardYear,
      citations: 8 + (i % 40),
    },
  ];

  const awards: AwardItem[] = [
    {
      title: `Excellence in ${specialty} Award`,
      organization: 'Pakistan Medical Association',
      year: String(boardYear + 5),
      icon: '🥇',
    },
    {
      title: 'Outstanding Clinical Educator',
      organization: hospital,
      year: String(boardYear + 3),
      icon: '🌟',
    },
    {
      title: 'Community Health Service Award',
      organization: `${city} Health Directorate`,
      year: String(boardYear + 1),
      icon: '🎖️',
    },
  ];

  const speakingEngagements: SpeakingItem[] = [
    {
      title: `Keynote: Advances in ${subSpecialty}`,
      venue: `Annual ${specialty} Conference, ${city}`,
      type: 'conference',
      year: String(boardYear + 5),
    },
    {
      title: `Grand Rounds: Approach to Complex ${specialty} Cases`,
      venue: hospital,
      type: 'lecture',
      year: String(boardYear + 4),
    },
    {
      title: `CME Webinar: ${expertise[0]} — Practical Updates`,
      venue: 'DrInsight CME Series',
      type: 'webinar',
      year: String(boardYear + 3),
    },
  ];

  const weeklySchedule: ScheduleDay[] = [
    { day: 'Monday', time: '9:00 AM – 5:00 PM (PKT)', available: true },
    { day: 'Tuesday', time: '9:00 AM – 5:00 PM (PKT)', available: true },
    { day: 'Wednesday', time: '9:00 AM – 1:00 PM (PKT)', available: true },
    { day: 'Thursday', time: '9:00 AM – 5:00 PM (PKT)', available: true },
    { day: 'Friday', time: '9:00 AM – 12:00 PM (PKT)', available: true },
    { day: 'Saturday', time: 'Not Available', available: false },
    { day: 'Sunday', time: 'Not Available', available: false },
  ];

  const credentials = pick(['MBBS · FCPS', 'MBBS · MD · FCPS', 'MBBS · FCPS · MRCP'], i);
  const patientsTreated = 80 + (i * 37) % 900;
  const successRate = Math.round((92 + (i % 8) + (i % 3) * 0.1) * 10) / 10;
  const responseHours = [2, 4, 6, 8, 12][i % 5];

  return {
    credentials,
    professionalTitle: `Consultant ${specialty}`,
    bioFull: doctorBioFull(firstName, lastName, specialty, city, experienceYears, hospital, university, subSpecialty),
    expertise,
    services: expertise.slice(0, 5),
    researchTags: expertise.slice(0, 6),
    educationHistory,
    certifications,
    publications,
    awards,
    speakingEngagements,
    weeklySchedule,
    city,
    country: 'Pakistan',
    gender,
    address: `${hospital}, ${city}, Pakistan`,
    patientsTreated,
    successRate,
    responseTime: `Typically within ${responseHours} hours`,
    linkedinUrl: `https://www.linkedin.com/in/dr-${firstName.toLowerCase()}-${lastName.toLowerCase()}-${i}`,
    twitterUrl: `https://twitter.com/Dr${firstName}${lastName.charAt(0)}${i}`,
    platformRole: i % 5 === 0 ? `${specialty} Section Editor` : `${specialty} Contributing Author`,
    editorialBoard: i % 5 === 0,
    medicalReviewerFor: `${specialty}, ${subSpecialty}`,
    conflictOfInterest: `Dr. ${firstName} ${lastName} declares no financial conflicts of interest related to any articles authored or reviewed on DrInsight. No commercial relationships with pharmaceutical companies, medical device manufacturers, or supplement companies relevant to published content.`,
    credentialsVerifiedAt: new Date(Date.UTC(2026, 5, 1 + (i % 20))),
  };
}

export function doctorStatus(index: number): UserStatus {
  if (index <= 45) return UserStatus.ACTIVE;
  if (index <= 48) return UserStatus.PENDING;
  return UserStatus.INACTIVE;
}

export function patientStatus(index: number): UserStatus {
  if (index <= 190) return UserStatus.ACTIVE;
  if (index <= 195) return UserStatus.INACTIVE;
  return UserStatus.SUSPENDED;
}

export function doctorAvailability(index: number): DoctorAvailability {
  const mod = index % 10;
  if (mod <= 5) return DoctorAvailability.AVAILABLE;
  if (mod <= 7) return DoctorAvailability.BUSY;
  return DoctorAvailability.OFFLINE;
}

export function dateOfBirth(seed: number): Date {
  const year = 1955 + (seed % 45);
  const month = seed % 12;
  const day = (seed % 27) + 1;
  return new Date(Date.UTC(year, month, day));
}

export function lastSeenAt(seed: number): Date | null {
  if (seed % 5 === 0) return null;
  const daysAgo = seed % 30;
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(9 + (seed % 12), seed % 60, 0, 0);
  return date;
}

export function emergencyContact(firstName: string, lastName: string, seed: number): string {
  const relation = pick(['Spouse', 'Brother', 'Sister', 'Father', 'Mother', 'Son', 'Daughter'], seed);
  return `${firstName} ${lastName} (${relation}) — ${pakistaniPhone(seed + 5000)}`;
}
