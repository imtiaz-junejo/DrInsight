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
  return `Dr. ${firstName} ${lastName} is a ${specialty.toLowerCase()} specialist based in ${city} with ${experienceYears} years of clinical experience. Currently affiliated with ${hospital}, Dr. ${lastName} provides evidence-based care for patients across Pakistan through in-person and telemedicine consultations. Fluent in multiple regional languages, they focus on accessible, patient-centered treatment aligned with PMDC standards.`;
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
