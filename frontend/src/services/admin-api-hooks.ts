"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Appointment, BlogPost, DoctorProfile, Paginated } from "@/services/api-hooks";

export interface PlatformStats {
  doctorCount: number;
  verifiedDoctorCount?: number;
  activeDoctorCount?: number;
  blogCount: number;
  patientCount: number;
  userCount?: number;
  adminCount?: number;
  usersThisWeek?: number;
  pendingDoctors?: number;
  patientsThisWeek?: number;
  patientsWithActiveBookings?: number;
  patientsWithActiveBookingsPercent?: number;
  askDoctorQuestionCount?: number;
  patientsAskedQuestionPercent?: number;
  publicationBookmarkCount?: number;
  savedArticlesAvgPerPatient?: number;
  verifiedDoctorPercent?: number;
  averageRatingChange?: number;
  answeredQuestions: number;
  pendingQuestions?: number;
  averageRating: number;
  appointmentCount?: number;
  completedAppointments?: number;
  pendingAppointments?: number;
  cancelledAppointments?: number;
  appointmentsLast30Days?: number;
  appointmentsGrowthPercent?: number;
  reviewCount?: number;
  specialtyCount?: number;
  prescriptionCount?: number;
  paymentCount?: number;
  revenueCents?: number;
  revenueLast30DaysCents?: number;
  revenueGrowthPercent?: number;
  paymentsLast30Days?: number;
  notificationCount?: number;
  messageCount?: number;
  newsletterCount?: number;
  contactCount?: number;
  patientsServed?: number;
}

export interface PendingUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  createdAt: string;
  doctorProfile?: { specialty: string; licenseNumber: string } | null;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  readAt?: string | null;
  createdAt: string;
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

export function useAdminUsers(params?: { role?: string; page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<AdminUser>>("/users", { params });
      return data;
    },
  });
}

export function useAdminAppointments(params?: {
  page?: number;
  limit?: number;
  status?: string;
  kind?: "PHYSICAL" | "ONLINE";
  range?: "today" | "upcoming" | "past";
  search?: string;
}) {
  return useQuery({
    queryKey: ["admin-appointments", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Appointment>>("/appointments", { params });
      return data;
    },
  });
}

export interface AdminQuestion {
  id: string;
  category: string;
  title?: string | null;
  question: string;
  answer?: string | null;
  status: string;
  rejectReason?: string | null;
  createdAt: string;
  answeredAt?: string | null;
  approvedAt?: string | null;
  submitterName?: string | null;
  attachments?: unknown;
  submitter?: { id: string; firstName: string; lastName: string; email: string } | null;
  doctor?: {
    id: string;
    specialty: string;
    user?: { id: string; firstName: string; lastName: string };
  } | null;
  answeredBy?: { firstName: string; lastName: string } | null;
}

export function useAdminQuestions(params?: {
  view?: "pending" | "approved" | "rejected" | "answered" | "reports";
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  doctorId?: string;
  from?: string;
  to?: string;
}) {
  return useQuery({
    queryKey: ["admin-questions", params],
    queryFn: async () => {
      const { data } = await api.get<{
        data?: AdminQuestion[];
        meta?: { total: number; page: number; limit: number; totalPages: number };
        stats?: { pending: number; approved: number; answered: number; rejected: number };
        totals?: { pending: number; approved: number; answered: number; rejected: number };
        byCategory?: Array<{ category: string; count: number }>;
        byMonth?: Array<{ month: string; count: number }>;
      }>("/ask-doctor/admin", { params });
      return data;
    },
  });
}

export function useApproveQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, doctorId }: { id: string; doctorId?: string }) => {
      const { data } = await api.patch(`/ask-doctor/${id}/approve`, { doctorId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-nav-badges"] });
    },
  });
}

export function useAdminRejectQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data } = await api.patch(`/ask-doctor/${id}/admin-reject`, { reason });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-nav-badges"] });
    },
  });
}

export function useReassignQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, doctorId }: { id: string; doctorId: string }) => {
      const { data } = await api.patch(`/ask-doctor/${id}/reassign`, { doctorId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
    },
  });
}

export function useUpdateDoctorSeo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      doctorId,
      ...body
    }: {
      doctorId: string;
      profileSlug?: string;
      seoFocusKeyword?: string;
      seoSecondaryKeywords?: string;
      seoMetaTitle?: string;
      seoMetaDescription?: string;
      seoSchemaJson?: unknown;
      bookingEnabled?: boolean;
      contactEnabled?: boolean;
      onlineAvailEnabled?: boolean;
      physicalAvailEnabled?: boolean;
    }) => {
      const { data } = await api.patch(`/doctors/${doctorId}/seo`, body);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
      queryClient.invalidateQueries({ queryKey: ["admin-doctor-manage"] });
      queryClient.invalidateQueries({ queryKey: ["admin-doctor-detail", variables.doctorId] });
    },
  });
}

export interface AdminDoctorListItem extends DoctorProfile {
  user?: DoctorProfile["user"] & { lastSeenAt?: string | null };
}

export interface AdminDoctorContentItem {
  id: string;
  title: string;
  slug?: string;
  category?: string;
  type?: string;
  venue?: string;
  date?: string;
  views?: number;
  status: string;
  statusLabel: string;
}

export function useAdminDoctorManage(params?: {
  page?: number;
  limit?: number;
  search?: string;
  specialty?: string;
  city?: string;
  gender?: string;
  accountStatus?: string;
  verificationStatus?: string;
  sort?: string;
  order?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: ["admin-doctor-manage", params],
    queryFn: async () => {
      const { data } = await api.get<{
        data: AdminDoctorListItem[];
        meta: { total: number; page: number; limit: number; totalPages: number };
        stats?: { customSeoCount: number };
      }>("/doctors/manage", { params });
      return data;
    },
  });
}

export function useAdminDoctorDetail(doctorId: string | null) {
  return useQuery({
    queryKey: ["admin-doctor-detail", doctorId],
    enabled: Boolean(doctorId),
    queryFn: async () => {
      const { data } = await api.get<DoctorProfile>(`/doctors/manage/${doctorId}`);
      return data;
    },
  });
}

export function useAdminDoctorContent(doctorId: string | null) {
  return useQuery({
    queryKey: ["admin-doctor-content", doctorId],
    enabled: Boolean(doctorId),
    queryFn: async () => {
      const { data } = await api.get<{
        articles: AdminDoctorContentItem[];
        publications: AdminDoctorContentItem[];
      }>(`/doctors/manage/${doctorId}/content`);
      return data;
    },
  });
}

export function useUpdateAdminDoctorProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ doctorId, ...body }: { doctorId: string } & Record<string, unknown>) => {
      const { data } = await api.patch(`/doctors/${doctorId}/admin`, body);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-doctor-manage"] });
      queryClient.invalidateQueries({ queryKey: ["admin-doctor-detail", variables.doctorId] });
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}

export function useResetAdminDoctorSeo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (doctorId: string) => {
      const { data } = await api.patch(`/doctors/${doctorId}/admin/reset-seo`);
      return data;
    },
    onSuccess: (_data, doctorId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-doctor-manage"] });
      queryClient.invalidateQueries({ queryKey: ["admin-doctor-detail", doctorId] });
    },
  });
}

export function usePendingUsers() {
  return useQuery({
    queryKey: ["admin-pending-users"],
    queryFn: async () => {
      const { data } = await api.get<PendingUser[]>("/users/pending");
      return data;
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.patch(`/users/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
      queryClient.invalidateQueries({ queryKey: ["admin-doctor-manage"] });
      queryClient.invalidateQueries({ queryKey: ["admin-doctor-detail"] });
      queryClient.invalidateQueries({ queryKey: ["platform-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-profile"] });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.patch(`/appointments/${id}/status`, { status });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-appointment", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["admin-nav-badges"] });
    },
  });
}

export function useAdminDoctors(params?: { page?: number; limit?: number; search?: string; specialty?: string }) {
  return useQuery({
    queryKey: ["admin-doctors", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<DoctorProfile>>("/doctors", { params });
      return data;
    },
  });
}

export function useAdminBlogPosts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  authorId?: string;
  tag?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
}) {
  return useQuery({
    queryKey: ["admin-blog", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<BlogPost & { status?: string; createdAt?: string }>>(
        "/blog/manage",
        { params },
      );
      return data;
    },
  });
}

export function useAdminBlogCategories() {
  return useQuery({
    queryKey: ["admin-blog-categories"],
    queryFn: async () => {
      const { data } = await api.get<Array<{ id: string; name: string; slug: string }>>("/blog/categories");
      return data;
    },
  });
}

export function useAdminNotifications(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["admin-notifications", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<NotificationItem>>("/notifications", { params });
      return data;
    },
  });
}

export function useAdminUnreadNotifications() {
  return useQuery({
    queryKey: ["admin-notifications-unread"],
    queryFn: async () => {
      const { data } = await api.get<{ count: number }>("/notifications/unread-count");
      return data;
    },
  });
}

export function useAdminPrescriptions() {
  return useQuery({
    queryKey: ["admin-prescriptions"],
    queryFn: async () => {
      const { data } = await api.get<Array<{
        id: string;
        diagnosis?: string | null;
        items: Array<{ medication: string; dosage: string }>;
        createdAt: string;
        doctor?: { user?: { firstName: string; lastName: string } };
        patient?: { user?: { firstName: string; lastName: string } };
      }>>("/prescriptions");
      return data;
    },
  });
}

export function useAdminContactSubmissions() {
  return useQuery({
    queryKey: ["admin-contact-submissions"],
    queryFn: async () => {
      const { data } = await api.get<Array<{
        id: string;
        name: string;
        email: string;
        subject?: string | null;
        message: string;
        isRead?: boolean;
        status?: string;
        createdAt: string;
      }>>("/contact/submissions");
      return data;
    },
  });
}

export function useAdminPayments(params?: { page?: number; limit?: number; status?: string; search?: string }) {
  return useQuery({
    queryKey: ["admin-payments", params],
    queryFn: async () => {
      const { data } = await api.get<{
        data: Array<{
          id: string;
          amountCents: number;
          currency: string;
          status: string;
          confirmedAt?: string | null;
          createdAt: string;
          providerIntentId: string;
          receiptUrl?: string | null;
          invoiceNumber?: string | null;
          bookingDraft?: {
            doctor?: { user?: { firstName: string; lastName: string } };
            patient?: { user?: { firstName: string; lastName: string; email?: string } };
          };
        }>;
        meta: { total: number; page: number; limit: number; totalPages: number };
      }>("/payments/admin", { params });
      return data;
    },
  });
}

export function useAdminPaymentAnalytics(params?: { range?: string; from?: string; to?: string }) {
  return useQuery({
    queryKey: ["admin-payment-analytics", params],
    queryFn: async () => {
      const { data } = await api.get<{
        totalPayments: number;
        succeededPayments: number;
        failedPayments: number;
        pendingPayments: number;
        refundedPayments: number;
        totalRevenueCents: number;
        consultationRevenueCents: number;
        platformFeesCents: number;
        successRate: number;
        monthlyRevenue: Array<{ month: string; amountCents: number }>;
        dailyRevenue: Array<{ day: string; amountCents: number }>;
        pendingPayouts: Array<{
          doctorName: string;
          specialty: string;
          amountCents: number;
          period: string;
          status: string;
        }>;
        stats: {
          revenueChange: number;
          revenueTag: string;
          revenueTagClass: string;
          consultationShare: string;
          platformShare: string;
        };
      }>("/payments/admin/analytics", { params });
      return data;
    },
  });
}

export function useRefundPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data } = await api.post(`/payments/admin/${id}/refund`, { reason });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-payment-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["platform-stats"] });
    },
  });
}

export interface TrustedPartner {
  id: string;
  companyName: string;
  websiteUrl?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FounderCredential {
  icon: string;
  text: string;
}

export interface FounderMessage {
  id: string;
  founderName: string;
  designation: string;
  imageUrl?: string | null;
  headline: string;
  messageHtml: string;
  signatureImageUrl?: string | null;
  videoUrl?: string | null;
  isActive: boolean;
  eyebrow?: string | null;
  subline?: string | null;
  badgeText?: string | null;
  credentials?: FounderCredential[] | null;
  tags: string[];
  signatureName?: string | null;
  signatureTitle?: string | null;
  locationLine?: string | null;
  updatedAt?: string;
}

export function useAdminTrustedPartners(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "active" | "inactive";
}) {
  return useQuery({
    queryKey: ["admin-trusted-partners", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<TrustedPartner>>("/about/partners/manage", { params });
      return data;
    },
  });
}

export function useCreateTrustedPartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<TrustedPartner>) => {
      const { data } = await api.post<TrustedPartner>("/about/partners", body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trusted-partners"] });
      queryClient.invalidateQueries({ queryKey: ["trusted-partners"] });
    },
  });
}

export function useUpdateTrustedPartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<TrustedPartner> & { id: string }) => {
      const { data } = await api.patch<TrustedPartner>(`/about/partners/${id}`, body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trusted-partners"] });
      queryClient.invalidateQueries({ queryKey: ["trusted-partners"] });
    },
  });
}

export function useDeleteTrustedPartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/about/partners/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trusted-partners"] });
      queryClient.invalidateQueries({ queryKey: ["trusted-partners"] });
    },
  });
}

export function useReorderTrustedPartners() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: Array<{ id: string; displayOrder: number }>) => {
      const { data } = await api.patch("/about/partners/reorder", { items });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trusted-partners"] });
      queryClient.invalidateQueries({ queryKey: ["trusted-partners"] });
    },
  });
}

export function useUpdateTrustedPartnerStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data } = await api.patch(`/about/partners/${id}/status`, { isActive });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trusted-partners"] });
      queryClient.invalidateQueries({ queryKey: ["trusted-partners"] });
    },
  });
}

export function useAdminFounderMessage() {
  return useQuery({
    queryKey: ["admin-founder-message"],
    queryFn: async () => {
      const { data } = await api.get<FounderMessage>("/about/founder/manage");
      return data;
    },
  });
}

export function useUpsertFounderMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<FounderMessage>) => {
      const { data } = await api.put<FounderMessage>("/about/founder", body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-founder-message"] });
      queryClient.invalidateQueries({ queryKey: ["founder-message"] });
    },
  });
}

export interface AdminUserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  avatarUrl?: string | null;
  phone?: string | null;
  emailVerified: boolean;
  isOnline: boolean;
  lastSeenAt?: string | null;
  createdAt: string;
  doctorProfile?: Record<string, unknown> | null;
  patientProfile?: Record<string, unknown> | null;
  stats: {
    appointmentCount: number;
    completedAppointments: number;
    upcomingAppointments: number;
    blogPostCount: number;
    publicationCount: number;
    publicationBookmarkCount: number;
  };
  recentAppointments: Array<Record<string, unknown>>;
  recentBlogPosts: Array<Record<string, unknown>>;
  recentPublications: Array<Record<string, unknown>>;
  auditLogs: Array<{
    id: string;
    action: string;
    target?: string | null;
    severity: string;
    result: string;
    createdAt: string;
  }>;
}

export interface AdminAppointmentDetail {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  consultationType: string;
  status: string;
  reason?: string | null;
  notes?: string | null;
  meetingRoomId?: string | null;
  videoProvider?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  createdAt: string;
  updatedAt: string;
  doctor?: {
    id: string;
    specialty: string;
    userId: string;
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string | null;
      avatarUrl?: string | null;
      status: string;
    };
  };
  patient?: {
    id: string;
    userId: string;
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string | null;
      avatarUrl?: string | null;
      status: string;
    };
  };
  payment?: {
    id: string;
    status: string;
    amountCents: number;
    currency: string;
    providerIntentId: string;
    receiptUrl?: string | null;
    invoiceNumber?: string | null;
    confirmedAt?: string | null;
    paymentMethod?: string | null;
    billingName?: string | null;
    billingEmail?: string | null;
    createdAt: string;
  } | null;
  prescription?: {
    id: string;
    diagnosis?: string | null;
    items: unknown;
    notes?: string | null;
    pdfUrl?: string | null;
    createdAt: string;
  } | null;
  review?: {
    id: string;
    rating: number;
    comment?: string | null;
    createdAt: string;
  } | null;
  auditLogs: Array<{
    id: string;
    action: string;
    actorName: string;
    target?: string | null;
    severity: string;
    result: string;
    createdAt: string;
  }>;
}

export interface AdminBlogPostDetail {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string | null;
  status: string;
  viewCount: number;
  shareCount: number;
  helpfulYes: number;
  helpfulNo: number;
  peerReviewed: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  specialty?: string | null;
  citationCount?: number;
  bookmarkCount?: number;
  downloadCount?: number;
  category?: { id: string; name: string; slug: string };
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    doctorProfile?: { specialty?: string };
  };
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  _count?: { comments: number; ratings: number };
}

export function useAdminUserProfile(userId: string) {
  return useQuery({
    queryKey: ["admin-user-profile", userId],
    queryFn: async () => {
      const { data } = await api.get<AdminUserProfile>(`/users/${userId}/profile`);
      return data;
    },
    enabled: Boolean(userId),
  });
}

export function useAdminAppointment(appointmentId: string) {
  return useQuery({
    queryKey: ["admin-appointment", appointmentId],
    queryFn: async () => {
      const { data } = await api.get<AdminAppointmentDetail>(`/appointments/${appointmentId}`);
      return data;
    },
    enabled: Boolean(appointmentId),
  });
}

export function useAdminBlogPost(slug: string) {
  return useQuery({
    queryKey: ["admin-blog-post", slug],
    queryFn: async () => {
      const { data } = await api.get<AdminBlogPostDetail>(`/blog/manage/${slug}`);
      return data;
    },
    enabled: Boolean(slug),
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      const { data } = await api.delete(`/blog/manage/${slug}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-profile"] });
    },
  });
}

