"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Appointment, BlogPost, DoctorProfile, Paginated } from "@/services/api-hooks";

export interface DoctorPatient {
  patientId: string;
  user: { id: string; firstName: string; lastName: string; avatarUrl: string | null };
  lastVisit: string;
  nextAppt: string | null;
  appointmentCount: number;
}

export interface AskDoctorQuestion {
  id: string;
  category: string;
  question: string;
  answer?: string | null;
  status: string;
  isAnonymous: boolean;
  submitterName?: string | null;
  createdAt: string;
  answeredAt?: string | null;
  answeredBy?: { firstName: string; lastName: string; role: string } | null;
}

export interface DoctorEarnings {
  totalCents: number;
  paymentCount: number;
  monthly: Array<{ month: string; amountCents: number }>;
}

export interface Prescription {
  id: string;
  diagnosis?: string | null;
  notes?: string | null;
  items: Array<{ medication: string; dosage: string; frequency: string; duration: string; instructions?: string }>;
  createdAt: string;
  patient?: { user?: { firstName: string; lastName: string } };
  appointment?: { scheduledAt: string };
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  patient?: { user?: { firstName: string; lastName: string; avatarUrl?: string | null } };
}

export function useDoctorAppointments(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ["doctor-appointments", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Appointment>>("/appointments", { params });
      return data;
    },
  });
}

export function useDoctorNotifications() {
  return useQuery({
    queryKey: ["doctor-notifications"],
    queryFn: async () => {
      const { data } = await api.get<Paginated<{ id: string; title: string; body: string; readAt?: string | null }>>(
        "/notifications",
      );
      return data;
    },
  });
}

export function useDoctorProfile() {
  return useQuery({
    queryKey: ["doctor-profile"],
    queryFn: async () => {
      const { data } = await api.get<DoctorProfile>("/doctors/me/profile");
      return data;
    },
  });
}

export function useUpdateDoctorProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const { data } = await api.patch("/doctors/profile", body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-profile"] });
    },
  });
}

export function useDoctorPatients() {
  return useQuery({
    queryKey: ["doctor-patients"],
    queryFn: async () => {
      const { data } = await api.get<DoctorPatient[]>("/doctors/me/patients");
      return data;
    },
  });
}

export function useDoctorPrescriptions() {
  return useQuery({
    queryKey: ["doctor-prescriptions"],
    queryFn: async () => {
      const { data } = await api.get<Prescription[]>("/prescriptions");
      return data;
    },
  });
}

export function useDoctorEarnings() {
  return useQuery({
    queryKey: ["doctor-earnings"],
    queryFn: async () => {
      const { data } = await api.get<DoctorEarnings>("/payments/earnings");
      return data;
    },
  });
}

export function useDoctorBlogPosts(authorId?: string) {
  return useQuery({
    queryKey: ["doctor-blog", authorId],
    queryFn: async () => {
      const { data } = await api.get<Paginated<BlogPost & { status?: string; viewCount?: number }>>("/blog", {
        params: { authorId, limit: 50 },
      });
      return data;
    },
    enabled: !!authorId,
  });
}

export function useDoctorReviews(doctorId?: string) {
  return useQuery({
    queryKey: ["doctor-reviews", doctorId],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Review>>(`/reviews/doctor/${doctorId}`);
      return data;
    },
    enabled: !!doctorId,
  });
}

export function usePendingQuestions() {
  return useQuery({
    queryKey: ["pending-questions"],
    queryFn: async () => {
      const { data } = await api.get<Paginated<AskDoctorQuestion>>("/ask-doctor/pending");
      return data;
    },
  });
}

export function useAnswerQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, answer }: { id: string; answer: string }) => {
      const { data } = await api.patch(`/ask-doctor/${id}/answer`, { answer });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-questions"] });
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
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
    },
  });
}
