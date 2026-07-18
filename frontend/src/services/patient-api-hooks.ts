"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import type { Appointment, Paginated } from "@/services/api-hooks";
import type { ClinicalNoteAttachment, ClinicalNotesListParams, PatientClinicalNote } from "@/services/doctor-api-hooks";

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
  country?: string | null;
  province?: string | null;
  city?: string | null;
  address?: string | null;
  postalCode?: string | null;
  createdAt: string;
  lastSeenAt?: string | null;
  doctorProfile?: Record<string, unknown> | null;
  patientProfile?: {
    dateOfBirth?: string | null;
    gender?: string | null;
    bloodGroup?: string | null;
    allergies?: string[];
    medicalHistory?: string | null;
    emergencyContact?: string | null;
    city?: string | null;
    province?: string | null;
    country?: string | null;
    address?: string | null;
    postalCode?: string | null;
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

export function usePatientAppointments(
  params?: { page?: number; limit?: number; status?: string; kind?: "PHYSICAL" | "ONLINE"; range?: "upcoming" | "past" | "today" },
  pollLive = false,
) {
  return useQuery({
    queryKey: ["patient-appointments", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Appointment>>("/appointments", { params });
      return data;
    },
    refetchInterval: pollLive ? 5000 : false,
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

export function usePatientClinicalNotes(params?: ClinicalNotesListParams & { doctorId?: string }) {
  return useQuery({
    queryKey: ["patient-clinical-notes", params],
    queryFn: async () => {
      const { data } = await api.get<{
        items: PatientClinicalNote[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>("/patients/me/notes", { params });
      return data;
    },
  });
}

export function usePatientClinicalNote(noteId?: string) {
  return useQuery({
    queryKey: ["patient-clinical-note", noteId],
    queryFn: async () => {
      const { data } = await api.get<PatientClinicalNote>(`/patients/me/notes/${noteId}`);
      return data;
    },
    enabled: !!noteId,
  });
}

export function useCreatePatientClinicalNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      doctorId: string;
      title: string;
      noteType?: string;
      clinicalNotes: string;
      followUpNotes?: string;
      appointmentId?: string;
      priority?: string;
      attachments?: ClinicalNoteAttachment[];
      followUpReminderAt?: string;
    }) => {
      const { data } = await api.post("/patients/me/notes", body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-clinical-notes"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useUpdatePatientClinicalNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      noteId,
      body,
    }: {
      noteId: string;
      body: Partial<{
        title: string;
        noteType: string;
        clinicalNotes: string;
        followUpNotes: string;
        priority: string;
        attachments: ClinicalNoteAttachment[];
        followUpReminderAt: string;
      }>;
    }) => {
      const { data } = await api.patch(`/patients/me/notes/${noteId}`, body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-clinical-notes"] });
    },
  });
}

export function useDeletePatientClinicalNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (noteId: string) => {
      const { data } = await api.delete(`/patients/me/notes/${noteId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-clinical-notes"] });
    },
  });
}

export function useMarkPatientNoteRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (noteId: string) => {
      const { data } = await api.patch(`/patients/me/notes/${noteId}/read`);
      return data;
    },
    onSuccess: (_, noteId) => {
      queryClient.invalidateQueries({ queryKey: ["patient-clinical-notes"] });
      queryClient.invalidateQueries({ queryKey: ["patient-clinical-note", noteId] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export interface PatientDashboardCounts {
  ocPending: number;
  ocUpcoming: number;
  ocOngoing: number;
  physPending: number;
  physUpcoming: number;
  physConfirmed: number;
  qaPending: number;
  qaAnswered: number;
  qaRejected: number;
  savedArticles: number;
}

export interface PatientVitalItem {
  id: string;
  val: string;
  unit: string;
  label: string;
  badge: string;
  badgeLabel: string;
  recordedAt: string;
}

export interface PatientHealthScore {
  score: number;
  status: string;
  attentionCount: number;
  dimensions: { label: string; value: number; color: string }[];
}

export interface PatientQuestion {
  id: string;
  category: string;
  title?: string | null;
  question: string;
  answer?: string | null;
  status: string;
  rejectReason?: string | null;
  createdAt: string;
  answeredAt?: string | null;
  answeredBy?: {
    firstName: string;
    lastName: string;
    doctorProfile?: { specialty?: string | null } | null;
  } | null;
  doctor?: {
    user?: { firstName: string; lastName: string };
    specialty?: string | null;
  } | null;
}

export interface HealthToolHistoryItem {
  id: string;
  resultSummary?: string | null;
  notes?: string | null;
  createdAt: string;
  tool: { name: string; iconEmoji?: string | null; slug: string };
}

export function usePatientDashboardCounts() {
  return useQuery({
    queryKey: ["patient-dashboard-counts"],
    queryFn: async () => {
      const { data } = await api.get<PatientDashboardCounts>("/appointments/patient/counts");
      return data;
    },
    refetchInterval: 30000,
  });
}

export function usePatientHealthVitals() {
  return useQuery({
    queryKey: ["patient-health-vitals"],
    queryFn: async () => {
      const { data } = await api.get<{ data: PatientVitalItem[]; lastRecordedAt: string | null }>("/patients/me/health/vitals");
      return data;
    },
  });
}

export function usePatientHealthScore() {
  return useQuery({
    queryKey: ["patient-health-score"],
    queryFn: async () => {
      const { data } = await api.get<PatientHealthScore>("/patients/me/health/score");
      return data;
    },
  });
}

export function usePatientHealthToolHistory(limit = 20) {
  return useQuery({
    queryKey: ["patient-health-tool-history", limit],
    queryFn: async () => {
      const { data } = await api.get<HealthToolHistoryItem[]>("/patients/me/health/tools/history", { params: { limit } });
      return data;
    },
  });
}

export function useCreatePatientVital() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      type: string;
      value: string;
      unit?: string;
      status?: string;
      notes?: string;
    }) => {
      const { data } = await api.post("/patients/me/health/vitals", body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-health-vitals"] });
      queryClient.invalidateQueries({ queryKey: ["patient-health-score"] });
    },
  });
}

export function usePatientQuestions(view: "pending" | "answered" | "rejected", params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["patient-questions", view, params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<PatientQuestion>>("/ask-doctor/patient/my", {
        params: { view, ...params },
      });
      return data;
    },
  });
}

export function useSubmitPatientQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      category: string;
      title: string;
      question: string;
      doctorId?: string;
      isAnonymous?: boolean;
    }) => {
      const { data } = await api.post<PatientQuestion>("/ask-doctor/patient", body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-questions"] });
      queryClient.invalidateQueries({ queryKey: ["patient-dashboard-counts"] });
    },
  });
}

export function useSavedBlogPosts(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["patient-saved-articles", params],
    queryFn: async () => {
      const { data } = await api.get<{ data: Array<import("@/services/api-hooks").BlogPost & { readPercent?: number }>; meta: Paginated<unknown>["meta"] }>(
        "/blog/saved",
        { params },
      );
      return data;
    },
  });
}

export function useToggleBlogBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, saved }: { slug: string; saved: boolean }) => {
      if (saved) {
        await api.delete(`/blog/saved/${slug}`);
      } else {
        await api.post(`/blog/saved/${slug}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-saved-articles"] });
      queryClient.invalidateQueries({ queryKey: ["patient-dashboard-counts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });
}
