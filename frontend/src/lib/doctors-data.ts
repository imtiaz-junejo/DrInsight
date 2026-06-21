export interface Doctor {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  specialtyKey: string;
  country: string;
  countryKey: string;
  rating: number;
  reviews: number;
  experience: number;
  online: boolean;
  gradient: string;
  languages: string[];
  nextAvailable: string;
}

export const doctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sarah Mitchell",
    initials: "SM",
    specialty: "Cardiology",
    specialtyKey: "cardiology",
    country: "USA",
    countryKey: "usa",
    rating: 4.9,
    reviews: 312,
    experience: 18,
    online: true,
    gradient: "linear-gradient(135deg,#1a56a0,#0891b2)",
    languages: ["English", "Spanish"],
    nextAvailable: "Today, 3:00 PM",
  },
  {
    id: "2",
    name: "Dr. James Okafor",
    initials: "JO",
    specialty: "Neurology",
    specialtyKey: "neurology",
    country: "UK",
    countryKey: "uk",
    rating: 4.8,
    reviews: 198,
    experience: 15,
    online: false,
    gradient: "linear-gradient(135deg,#7c3aed,#4a90d9)",
    languages: ["English"],
    nextAvailable: "Tomorrow, 10:00 AM",
  },
  {
    id: "3",
    name: "Dr. Priya Sharma",
    initials: "PS",
    specialty: "Endocrinology",
    specialtyKey: "endocrinology",
    country: "India",
    countryKey: "india",
    rating: 4.9,
    reviews: 276,
    experience: 12,
    online: true,
    gradient: "linear-gradient(135deg,#059669,#0891b2)",
    languages: ["English", "Hindi"],
    nextAvailable: "Today, 5:30 PM",
  },
  {
    id: "4",
    name: "Dr. Javed Kumbhar",
    initials: "JK",
    specialty: "Internal Medicine",
    specialtyKey: "internal medicine",
    country: "Pakistan",
    countryKey: "pakistan",
    rating: 5.0,
    reviews: 421,
    experience: 22,
    online: true,
    gradient: "linear-gradient(135deg,#1a56a0,#0891b2)",
    languages: ["English", "Urdu"],
    nextAvailable: "Today, 2:00 PM",
  },
  {
    id: "5",
    name: "Dr. Emily Chen",
    initials: "EC",
    specialty: "Psychiatry",
    specialtyKey: "psychiatry",
    country: "USA",
    countryKey: "usa",
    rating: 4.7,
    reviews: 154,
    experience: 10,
    online: false,
    gradient: "linear-gradient(135deg,#7c3aed,#ec4899)",
    languages: ["English", "Mandarin"],
    nextAvailable: "Wed, 11:00 AM",
  },
  {
    id: "6",
    name: "Dr. Carlos Rivera",
    initials: "CR",
    specialty: "Pediatrics",
    specialtyKey: "pediatrics",
    country: "USA",
    countryKey: "usa",
    rating: 4.8,
    reviews: 189,
    experience: 14,
    online: true,
    gradient: "linear-gradient(135deg,#f59e0b,#059669)",
    languages: ["English", "Spanish"],
    nextAvailable: "Today, 4:15 PM",
  },
  {
    id: "7",
    name: "Dr. Ahmed Hassan",
    initials: "AH",
    specialty: "Orthopedics",
    specialtyKey: "orthopedics",
    country: "Pakistan",
    countryKey: "pakistan",
    rating: 4.6,
    reviews: 143,
    experience: 16,
    online: false,
    gradient: "linear-gradient(135deg,#ea580c,#d97706)",
    languages: ["English", "Urdu", "Arabic"],
    nextAvailable: "Thu, 9:00 AM",
  },
];
