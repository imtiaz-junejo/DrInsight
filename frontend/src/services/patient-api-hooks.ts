"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
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
  appointment?: {
    scheduledAt: string;
    doctor?: { user?: { firstName: string; lastName: string } };
  };
}

export function useAuthProfile() {
  return useQuery({
    queryKey: ["auth-profile"],
    queryFn: async () => {
      const { data } = await api.get<AuthProfile>("/auth/me");
      return data;
    },
  });
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

export function usePatientPayments() {
  return useQuery({
    queryKey: ["patient-payments"],
    queryFn: async () => {
      const { data } = await api.get<PaymentRecord[]>("/payments/history");
      return data;
    },
  });
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
