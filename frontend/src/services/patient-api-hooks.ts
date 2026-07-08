"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import type { Appointment, Paginated } from "@/services/api-hooks";

export interface AuthProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  avatarUrl?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  createdAt: string;
  doctorProfile?: Record<string, unknown> | null;
  patientProfile?: {
    dateOfBirth?: string | null;
    gender?: string | null;
    bloodGroup?: string | null;
    allergies?: string[];
    medicalHistory?: string | null;
    emergencyContact?: string | null;
  } | null;
}

export interface PrescriptionItem {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  diagnosis?: string | null;
  notes?: string | null;
  items: PrescriptionItem[];
  createdAt: string;
  doctor?: { user?: { firstName: string; lastName: string } };
  appointment?: { scheduledAt: string };
}

export interface PaymentRecord {
  id: string;
  amountCents: number;
  currency: string;
  status: string;
  confirmedAt?: string | null;
  createdAt?: string;
  providerIntentId?: string;
  receiptUrl?: string | null;
  invoiceNumber?: string | null;
  appointment?: {
    id?: string;
    scheduledAt: string;
    consultationType?: string;
    doctor?: { user?: { firstName: string; lastName: string }; specialty?: string };
  };
  bookingDraft?: {
    scheduledAt?: string;
    doctor?: { user?: { firstName: string; lastName: string }; specialty?: string };
  };
}

export function useAuthProfile(options?: { enabled?: boolean }) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ["auth-profile", userId],
    queryFn: async () => {
      const { data } = await api.get<AuthProfile>("/auth/me");
      return data;
    },
    enabled: (options?.enabled ?? true) && Boolean(userId),
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function invalidateAuthProfile(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: ["auth-profile"] });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { firstName?: string; lastName?: string; phone?: string; avatarUrl?: string }) => {
      const { data } = await api.patch("/users/me", body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-profile"] });
    },
  });
}

export function useUpdatePatientProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      dateOfBirth?: string;
      gender?: string;
      bloodGroup?: string;
      allergies?: string[];
      medicalHistory?: string;
      emergencyContact?: string;
    }) => {
      const { data } = await api.patch("/users/me/patient-profile", body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-profile"] });
    },
  });
}

export function usePatientAppointments(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ["patient-appointments", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Appointment>>("/appointments", { params });
      return data;
    },
  });
}

export function usePatientPrescriptions() {
  return useQuery({
    queryKey: ["patient-prescriptions"],
    queryFn: async () => {
      const { data } = await api.get<Prescription[]>("/prescriptions");
      return data;
    },
  });
}

export function usePatientPayments(params?: { page?: number; limit?: number; status?: string; search?: string }) {
  return useQuery({
    queryKey: ["patient-payments", params],
    queryFn: async () => {
      const { data } = await api.get<{ data: PaymentRecord[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
        "/payments/history",
        { params },
      );
      return data;
    },
  });
}

export function downloadPaymentInvoice(paymentId: string) {
  return api.get(`/payments/${paymentId}/invoice`, { responseType: "blob" });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/appointments/${id}/status`, { status: "CANCELLED" });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}
