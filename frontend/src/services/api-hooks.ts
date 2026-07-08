"use client";

import { useMutation, useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

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
  consultationFees?: { video: number; phone: number; chat: number };
  rating: number;
  reviewCount: number;
  patientsTreated?: number;
  consultationCount?: number;
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
  hospital?: string | null;
  city?: string | null;
  country?: string | null;
  gender?: string | null;
  address?: string | null;
  coverImageUrl?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  platformRole?: string | null;
  editorialBoard?: boolean;
  medicalReviewerFor?: string | null;
  conflictOfInterest?: string | null;
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
  reason?: string | null;
  notes?: string | null;
  meetingRoomId?: string | null;
  payment?: { status: string; amountCents?: number; currency?: string } | null;
  doctor?: DoctorProfile;
  patient?: {
    user?: { firstName: string; lastName: string; avatarUrl?: string | null };
  };
}

export function useDoctors(params: { search?: string; specialty?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["doctors", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<DoctorProfile>>("/doctors", { params });
      return data;
    },
  });
}

export function useDoctorSpecialties() {
  return useQuery({
    queryKey: ["doctor-specialties"],
    queryFn: async () => {
      const { data } = await api.get<Array<{ name: string; count: number }>>("/doctors/specialties");
      return data;
    },
  });
}

export function useBlogPosts(
  params: {
    search?: string;
    category?: string;
    page?: number;
    limit?: number;
    status?: string;
    sort?: "recent" | "popular" | "mixed";
  },
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["blog", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<BlogPost>>("/blog", { params });
      return data;
    },
    enabled: options?.enabled ?? true,
  });
}

export function useFeaturedBlogPosts(limit = 3) {
  return useQuery({
    queryKey: ["blog", "featured", limit],
    queryFn: async () => {
      const { data } = await api.get<Paginated<BlogPost>>("/blog/featured", { params: { limit } });
      return data;
    },
  });
}

export function useBlogCategories() {
  return useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const { data } = await api.get<BlogCategory[]>("/blog/categories");
      return data;
    },
  });
}

export function usePopularBlogPosts(limit = 5) {
  return useQuery({
    queryKey: ["blog-popular", limit],
    queryFn: async () => {
      const { data } = await api.get<BlogPost[]>("/blog/popular", { params: { limit } });
      return data;
    },
  });
}

export function useTopBlogAuthors(limit = 5) {
  return useQuery({
    queryKey: ["blog-top-authors", limit],
    queryFn: async () => {
      const { data } = await api.get<BlogAuthorSummary[]>("/blog/top-authors", { params: { limit } });
      return data;
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog", slug],
    queryFn: async () => {
      const { data } = await api.get<BlogPostDetail>(`/blog/${slug}`);
      return data;
    },
    enabled: !!slug,
  });
}

export function useBlogPostComment(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { authorName: string; authorEmail?: string; content: string }) => {
      const { data } = await api.post(`/blog/${slug}/comments`, body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog", slug] });
    },
  });
}

export function useBlogPostFeedback(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { helpful?: boolean; rating?: number; visitorKey?: string }) => {
      const { data } = await api.post(`/blog/${slug}/feedback`, body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog", slug] });
    },
  });
}

export function useBlogPostShare(slug: string) {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/blog/${slug}/share`);
      return data;
    },
  });
}

export function useAppointments() {
  return useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Appointment>>("/appointments");
      return data;
    },
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await api.get<Paginated<{ id: string; title: string; body: string; readAt?: string | null }>>(
        "/notifications",
      );
      return data;
    },
  });
}

export function useCreateBookingDraft() {
  return useMutation({
    mutationFn: async (payload: {
      doctorId: string;
      scheduledAt: string;
      consultationType: "VIDEO" | "AUDIO" | "CHAT" | "IN_PERSON";
      reason?: string;
      durationMinutes?: number;
    }) => {
      const { data } = await api.post("/payments/booking-drafts", payload);
      return data as { id: string; amountCents: number; currency: string };
    },
  });
}

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: async (payload: {
      bookingDraftId: string;
      billingName?: string;
      billingEmail?: string;
      billingCountry?: string;
    }) => {
      const { data } = await api.post("/payments/intents", payload);
      return data as {
        id: string;
        providerIntentId: string;
        clientSecret: string;
        amountCents: number;
        consultationFeeCents?: number;
        platformFeeCents?: number;
        taxCents?: number;
      };
    },
  });
}

export function useVerifyPayment() {
  return useMutation({
    mutationFn: async (providerIntentId: string) => {
      const { data } = await api.post(`/payments/intents/${providerIntentId}/verify`);
      return data as {
        appointmentId?: string;
        status?: string;
        providerIntentId?: string;
      };
    },
  });
}

export function usePaymentConfirmation(appointmentId: string) {
  return useQuery({
    queryKey: ["payment-confirmation", appointmentId],
    queryFn: async () => {
      const { data } = await api.get(`/payments/confirmation/${appointmentId}`);
      return data as {
        appointmentId: string;
        doctor: string;
        specialty: string;
        patient: string;
        scheduledAt: string;
        consultationType: string;
        status: string;
        amountPaid: number;
        currency: string;
        paymentStatus: string;
        transactionId: string | null;
        receiptUrl: string | null;
        invoiceNumber: string | null;
        paymentId: string | null;
      };
    },
    enabled: !!appointmentId,
  });
}

export function useConfirmDevPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (providerIntentId: string) => {
      const { data } = await api.post("/payments/confirm-dev", { providerIntentId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: ["doctor", id],
    queryFn: async () => {
      const { data } = await api.get<DoctorProfile>(`/doctors/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export interface PlatformStats {
  doctorCount: number;
  verifiedDoctorCount?: number;
  activeDoctorCount?: number;
  blogCount: number;
  patientCount: number;
  userCount?: number;
  adminCount?: number;
  answeredQuestions: number;
  pendingQuestions?: number;
  averageRating: number;
  appointmentCount?: number;
  completedAppointments?: number;
  pendingAppointments?: number;
  cancelledAppointments?: number;
  appointmentsLast30Days?: number;
  reviewCount?: number;
  specialtyCount?: number;
  prescriptionCount?: number;
  paymentCount?: number;
  revenueCents?: number;
  revenueLast30DaysCents?: number;
  paymentsLast30Days?: number;
  notificationCount?: number;
  messageCount?: number;
  newsletterCount?: number;
  contactCount?: number;
  patientsServed?: number;
  countryCount?: number;
  hospitalCount?: number;
}

export interface BusinessHour {
  day: string;
  hours: string;
  closed: boolean;
}

export interface SiteSettings {
  contactPhone: string;
  contactEmail: string;
  contactWhatsapp?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  country: string;
  businessHours?: BusinessHour[] | null;
}

export interface FeaturedHospital {
  name: string;
  city: string | null;
  specialty: string;
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ["platform-stats"],
    queryFn: async () => {
      const { data } = await api.get<PlatformStats>("/platform/stats");
      return data;
    },
  });
}

export interface AskDoctorQuestion {
  id: string;
  category: string;
  question: string;
  answer?: string | null;
  status: string;
  isAnonymous: boolean;
  helpfulCount?: number;
  submitterName?: string | null;
  createdAt: string;
  answeredAt?: string | null;
  answeredBy?: {
    firstName: string;
    lastName: string;
    role: string;
    avatarUrl?: string | null;
    doctorProfile?: { specialty?: string | null; credentials?: string | null } | null;
  } | null;
}

export function useAskDoctorQuestions(params: { page?: number; limit?: number; category?: string; search?: string }) {
  return useQuery({
    queryKey: ["ask-doctor", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<AskDoctorQuestion>>("/ask-doctor", { params });
      return data;
    },
  });
}

export function useAskDoctorQuestionsInfinite(params: {
  limit?: number;
  category?: string;
  search?: string;
}) {
  return useInfiniteQuery({
    queryKey: ["ask-doctor", "infinite", params],
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get<Paginated<AskDoctorQuestion>>("/ask-doctor", {
        params: { ...params, page: pageParam },
      });
      return data;
    },
    getNextPageParam: (last) =>
      last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
    initialPageParam: 1,
  });
}

export function useAskDoctorCategories() {
  return useQuery({
    queryKey: ["ask-doctor-categories"],
    queryFn: async () => {
      const { data } = await api.get<Array<{ name: string; count: number }>>("/ask-doctor/categories");
      return data;
    },
  });
}

export function useSubmitQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { category: string; question: string; name?: string; isAnonymous?: boolean }) => {
      const { data } = await api.post("/ask-doctor", body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ask-doctor"] });
      queryClient.invalidateQueries({ queryKey: ["ask-doctor-categories"] });
      queryClient.invalidateQueries({ queryKey: ["platform-stats"] });
    },
  });
}

export function useMarkQuestionHelpful() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<{ id: string; helpfulCount: number }>(`/ask-doctor/${id}/helpful`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ask-doctor"] });
    },
  });
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  patient?: { user?: { firstName: string; lastName: string } };
  doctor?: { specialty: string; user?: { firstName: string; lastName: string } };
}

export function useRecentReviews(limit = 6) {
  return useQuery({
    queryKey: ["recent-reviews", limit],
    queryFn: async () => {
      const { data } = await api.get<Review[]>("/reviews/recent", { params: { limit } });
      return data;
    },
  });
}

export function useSiteContact() {
  return useQuery({
    queryKey: ["site-contact"],
    queryFn: async () => {
      const { data } = await api.get<SiteSettings>("/platform/contact");
      return data;
    },
  });
}

export function useFeaturedHospitals() {
  return useQuery({
    queryKey: ["featured-hospitals"],
    queryFn: async () => {
      const { data } = await api.get<FeaturedHospital[]>("/platform/hospitals");
      return data;
    },
  });
}

export function useContactSubmit() {
  return useMutation({
    mutationFn: async (body: { name: string; email: string; subject: string; message: string }) => {
      const { data } = await api.post("/contact", body);
      return data;
    },
  });
}

export function useNewsletterSubscribe() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post("/contact/newsletter", { email });
      return data;
    },
  });
}

export interface PublicTrustedPartner {
  id: string;
  companyName: string;
  websiteUrl?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  displayOrder: number;
}

export interface PublicFounderMessage {
  id: string;
  founderName: string;
  designation: string;
  imageUrl?: string | null;
  headline: string;
  messageHtml: string;
  signatureImageUrl?: string | null;
  videoUrl?: string | null;
  eyebrow?: string | null;
  subline?: string | null;
  badgeText?: string | null;
  credentials?: Array<{ icon: string; text: string }> | null;
  tags: string[];
  signatureName?: string | null;
  signatureTitle?: string | null;
  locationLine?: string | null;
}

export function useTrustedPartners() {
  return useQuery({
    queryKey: ["trusted-partners"],
    queryFn: async () => {
      const { data } = await api.get<PublicTrustedPartner[]>("/about/partners");
      return data;
    },
  });
}

export function useFounderMessage() {
  return useQuery({
    queryKey: ["founder-message"],
    queryFn: async () => {
      const { data } = await api.get<PublicFounderMessage | null>("/about/founder");
      return data;
    },
  });
}
