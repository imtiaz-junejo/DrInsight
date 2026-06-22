"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface DoctorProfile {
  id: string;
  specialty: string;
  subSpecialty?: string | null;
  bio?: string | null;
  experienceYears: number;
  consultationFee: string | number;
  rating: number;
  reviewCount: number;
  availability: string;
  languages: string[];
  hospital?: string | null;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    isOnline?: boolean;
  };
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  category?: { name: string; slug: string };
  author?: { firstName: string; lastName: string; avatarUrl?: string | null };
  readTimeMinutes: number;
  publishedAt?: string | null;
}

export interface Appointment {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  consultationType: string;
  status: string;
  meetingRoomId?: string | null;
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

export function useBlogPosts(params: { search?: string; category?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["blog", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<BlogPost>>("/blog", { params });
      return data;
    },
  });
}

export function useBlogCategories() {
  return useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const { data } = await api.get<Array<{ id: string; name: string; slug: string }>>("/blog/categories");
      return data;
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog", slug],
    queryFn: async () => {
      const { data } = await api.get<BlogPost>(`/blog/${slug}`);
      return data;
    },
    enabled: !!slug,
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
    mutationFn: async (bookingDraftId: string) => {
      const { data } = await api.post("/payments/intents", { bookingDraftId });
      return data as { id: string; providerIntentId: string; clientSecret: string; amountCents: number };
    },
  });
}

export function useConfirmDevPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (providerIntentId: string) => {
      const { data } = await api.post("/payments/webhooks/stripe", {
        providerIntentId,
        status: "succeeded",
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}
