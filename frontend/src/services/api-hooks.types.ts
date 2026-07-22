export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface DoctorEducationItem {
  year: string;
  title: string;
  institution: string;
  icon?: string;
}

export interface DoctorCertificationItem {
  title: string;
  subtitle: string;
  icon?: string;
}

export interface DoctorPublicationItem {
  journal: string;
  title: string;
  year: number;
  citations?: number;
  doi?: string;
  pubmedUrl?: string;
}

export interface DoctorAwardItem {
  title: string;
  organization: string;
  year: string;
  icon?: string;
}

export interface DoctorSpeakingItem {
  title: string;
  venue: string;
  type: "conference" | "lecture" | "webinar" | string;
  year: string;
}

export interface DoctorScheduleDay {
  day: string;
  time: string;
  available: boolean;
}

export interface DoctorArticleSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl?: string | null;
  readTimeMinutes: number;
  viewCount: number;
  averageRating?: number | null;
  ratingCount?: number;
  publishedAt?: string | null;
  tags?: string[];
  category?: { id?: string; name: string; slug: string };
}

export interface DoctorReviewItem {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  patient?: {
    user?: { firstName: string; lastName: string; avatarUrl?: string | null };
  };
  appointment?: { consultationType?: string; reason?: string | null } | null;
}

export interface RelatedDoctorSummary {
  id: string;
  specialty: string;
  subSpecialty?: string | null;
  rating: number;
  reviewCount: number;
  hospital?: string | null;
  city?: string | null;
  country?: string | null;
  experienceYears: number;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    isOnline?: boolean;
  };
}

export interface DoctorProfile {
  id: string;
  doctorNumber?: string | null;
  specialty: string;
  subSpecialty?: string | null;
  bio?: string | null;
  bioFull?: string | null;
  credentials?: string | null;
  professionalTitle?: string | null;
  education?: string | null;
  licenseNumber?: string;
  experienceYears: number;
  consultationFee: string | number;
  consultationFees?: { video: number; phone: number; chat: number; slotMinutes?: number };
  rating: number;
  reviewCount: number;
  patientsTreated?: number;
  consultationCount?: number;
  commentCount?: number;
  publicationCount?: number;
  articleCount?: number;
  successRate?: number | null;
  responseTime?: string | null;
  availability: string;
  languages: string[];
  expertise?: string[];
  services?: string[];
  researchTags?: string[];
  educationHistory?: DoctorEducationItem[] | null;
  certifications?: DoctorCertificationItem[] | null;
  publications?: DoctorPublicationItem[] | null;
  awards?: DoctorAwardItem[] | null;
  speakingEngagements?: DoctorSpeakingItem[] | null;
  weeklySchedule?: DoctorScheduleDay[] | null;
  clinicSchedule?: unknown;
  onlineSchedule?: unknown;
  hospital?: string | null;
  city?: string | null;
  country?: string | null;
  profileSlug?: string | null;
  seoFocusKeyword?: string | null;
  seoSecondaryKeywords?: string | null;
  seoMetaTitle?: string | null;
  seoMetaDescription?: string | null;
  seoSchemaJson?: unknown;
  gender?: string | null;
  address?: string | null;
  coverImageUrl?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  youtubeUrl?: string | null;
  websiteUrl?: string | null;
  orcidUrl?: string | null;
  researchGateUrl?: string | null;
  googleScholarUrl?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  authorType?: string | null;
  bookingEnabled?: boolean;
  contactEnabled?: boolean;
  onlineAvailEnabled?: boolean;
  physicalAvailEnabled?: boolean;
  researchGrantsTotal?: string | null;
  licenseBoard?: string | null;
  dateOfBirth?: string | null;
  verificationNote?: string | null;
  platformRole?: string | null;
  editorialBoard?: boolean;
  medicalReviewerFor?: string | null;
  conflictOfInterest?: string | null;
  coiUpdatedAt?: string | null;
  authorSince?: string | null;
  credentialsVerifiedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    isOnline?: boolean;
    email?: string;
    phone?: string | null;
    status?: string;
    createdAt?: string;
  };
  reviews?: DoctorReviewItem[];
  ratingDistribution?: Record<1 | 2 | 3 | 4 | 5, number> | { 1: number; 2: number; 3: number; 4: number; 5: number };
  articles?: DoctorArticleSummary[];
  articleStats?: { count: number; totalViews: number; avgReadTimeMinutes: number };
  relatedDoctors?: RelatedDoctorSummary[];
  similarSpecialists?: RelatedDoctorSummary[];
}

export interface BlogAuthorProfile {
  id?: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  role?: string;
  doctorProfile?: {
    id?: string;
    profileSlug?: string | null;
    specialty?: string | null;
    subSpecialty?: string | null;
    hospital?: string | null;
    credentials?: string | null;
    professionalTitle?: string | null;
    experienceYears?: number | null;
    bio?: string | null;
    platformRole?: string | null;
    editorialBoard?: boolean | null;
  } | null;
}

export interface BlogReference {
  text: string;
  url?: string;
}

export interface BlogGlossaryTerm {
  term: string;
  definition: string;
}

export interface BlogComment {
  id: string;
  authorName: string;
  authorEmail?: string | null;
  content: string;
  isVerifiedPatient?: boolean;
  createdAt: string;
}

export interface BlogPostNavItem {
  id: string;
  title: string;
  slug: string;
  readTimeMinutes?: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  excerpt: string;
  content?: string;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  coverImageCaption?: string | null;
  specialty?: string | null;
  category?: { id?: string; name: string; slug: string };
  author?: BlogAuthorProfile;
  reviewer?: BlogAuthorProfile | null;
  readTimeMinutes: number;
  viewCount?: number;
  shareCount?: number;
  tags?: string[];
  summaryPoints?: string[];
  keyTakeaways?: string[];
  references?: BlogReference[] | null;
  glossary?: BlogGlossaryTerm[] | null;
  medicalDisclaimer?: string | null;
  peerReviewed?: boolean;
  lastReviewedAt?: string | null;
  updatedAt?: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  metaKeywords?: string[];
  canonicalUrl?: string | null;
  averageRating?: number | null;
  ratingCount?: number;
  helpfulYes?: number;
  helpfulNo?: number;
  publishedAt?: string | null;
  featured?: boolean;
  relatedPosts?: BlogPost[];
}

export interface BlogPostDetail extends BlogPost {
  authorArticleCount?: number;
  sidebarRelated?: BlogPost[];
  trendingInSpecialty?: BlogPostNavItem[];
  previousPost?: BlogPostNavItem | null;
  nextPost?: BlogPostNavItem | null;
  comments?: BlogComment[];
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  postCount?: number;
}

export interface BlogAuthorSummary {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  specialty?: string | null;
  platformRole?: string | null;
  articleCount: number;
  totalViews: number;
}

export interface Appointment {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  consultationType: string;
  status: string;
  bookingSource?: string;
  reason?: string | null;
  notes?: string | null;
  cancelReason?: string | null;
  cancelledAt?: string | null;
  createdAt?: string;
  meetingRoomId?: string | null;
  roomId?: string | null;
  meetingStatus?: string | null;
  payment?: { status: string; amountCents?: number; currency?: string } | null;
  prescription?: { id: string } | null;
  doctor?: DoctorProfile & {
    user?: { id?: string; firstName: string; lastName: string; avatarUrl?: string | null };
  };
  patient?: {
    id?: string;
    patientNumber?: string | null;
    gender?: string | null;
    dateOfBirth?: string | null;
    user?: {
      id?: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string | null;
      phone?: string | null;
    };
  };
}
