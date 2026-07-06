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

export function useAdminAppointments(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ["admin-appointments", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Appointment>>("/appointments", { params });
      return data;
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
      queryClient.invalidateQueries({ queryKey: ["platform-stats"] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
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

export function useAdminPaymentAnalytics() {
  return useQuery({
    queryKey: ["admin-payment-analytics"],
    queryFn: async () => {
      const { data } = await api.get<{
        totalPayments: number;
        succeededPayments: number;
        failedPayments: number;
        pendingPayments: number;
        refundedPayments: number;
        totalRevenueCents: number;
        successRate: number;
        monthlyRevenue: Array<{ month: string; amountCents: number }>;
        dailyRevenue: Array<{ day: string; amountCents: number }>;
      }>("/payments/admin/analytics");
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

