"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import type { Appointment, BlogPost, DoctorProfile, Paginated } from "@/services/api-hooks";

export interface DoctorPatient {
  patientId: string;
  patientNumber?: string | null;
  user: { id: string; firstName: string; lastName: string; avatarUrl: string | null; phone?: string | null };
  lastVisit: string;
  nextAppt: string | null;
  appointmentCount: number;
  status?: string;
  isCritical?: boolean;
  condition?: string | null;
  age?: string | null;
  gender?: string | null;
}

export interface ClinicalNoteAttachment {
  name: string;
  url: string;
}

export interface PatientClinicalNote {
  id: string;
  patientId?: string;
  doctorId?: string;
  title: string;
  noteType: string;
  clinicalNotes: string;
  followUpNotes?: string | null;
  privateNotes?: string | null;
  authorId?: string;
  authorType?: "DOCTOR" | "PATIENT";
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  attachments?: ClinicalNoteAttachment[] | null;
  followUpReminderAt?: string | null;
  patientReadAt?: string | null;
  doctorReadAt?: string | null;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
  preview?: string;
  isUnread?: boolean;
  readStatus?: string;
  doctor?: { user?: { id?: string; firstName: string; lastName: string } };
  patient?: { user?: { id?: string; firstName: string; lastName: string } };
  author?: { id: string; firstName: string; lastName: string; role?: string };
  appointment?: { id: string; scheduledAt: string; status?: string; consultationType?: string } | null;
}

export interface ClinicalNotesListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  priority?: string;
  authorType?: string;
  appointmentId?: string;
  readStatus?: "read" | "unread";
  sortBy?: "createdAt" | "updatedAt" | "title" | "priority";
  sortOrder?: "asc" | "desc";
}

export interface PatientCriticalAlert {
  id: string;
  severity: "CRITICAL" | "URGENT" | "STABLE";
  category: string;
  reason: string;
  clinicalNotes?: string | null;
  attachments?: unknown;
  reviewDate?: string | null;
  notifyTeam: boolean;
  status: "ACTIVE" | "RESOLVED" | "REMOVED";
  createdAt: string;
  resolvedAt?: string | null;
  history?: Array<{
    id: string;
    action: string;
    details?: string | null;
    createdAt: string;
  }>;
}

export interface PatientDetail {
  patientId: string;
  patientNumber?: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string | null;
    avatarUrl?: string | null;
    createdAt: string;
  };
  dateOfBirth?: string | null;
  gender?: string | null;
  bloodGroup?: string | null;
  allergies: string[];
  medicalHistory?: string | null;
  emergencyContact?: string | null;
  memberSince: string;
  status: string;
  isCritical: boolean;
  activeAlert?: PatientCriticalAlert | null;
  lastVisit?: string | null;
  nextAppt?: string | null;
  condition?: string | null;
  medications: Array<{ name: string; dosage: string; status: string }>;
  consultationHistory: Array<{
    id: string;
    scheduledAt: string;
    status: string;
    reason?: string | null;
    consultationType: string;
    hasPrescription: boolean;
  }>;
  recentNotes: PatientClinicalNote[];
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
  patientId?: string;
  doctorId?: string;
  diagnosis?: string | null;
  notes?: string | null;
  items: Array<{
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    strength?: string;
    route?: string;
    food?: string;
    quantity?: string;
    refill?: string;
  }>;
  status?: string;
  prescriptionNumber?: string | null;
  verifyId?: string | null;
  extendedData?: Record<string, unknown> | null;
  followUpDate?: string | null;
  digitalSignature?: string | null;
  issuedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  patient?: {
    id?: string;
    patientNumber?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
    bloodGroup?: string | null;
    allergies?: string[];
    medicalHistory?: string | null;
    emergencyContact?: string | null;
    city?: string | null;
    country?: string | null;
    user?: { firstName: string; lastName: string; email?: string; phone?: string | null };
  };
  appointment?: {
    scheduledAt: string;
    id?: string;
    status?: string;
    consultationType?: string;
    reason?: string | null;
    notes?: string | null;
  };
  doctor?: {
    id?: string;
    doctorNumber?: string | null;
    specialty?: string;
    credentials?: string | null;
    professionalTitle?: string | null;
    education?: string | null;
    licenseNumber?: string | null;
    user?: { firstName: string; lastName: string };
  };
}

export interface PrescriptionStats {
  total: number;
  issued: number;
  pending: number;
  draft: number;
}

export type PrescriptionStatusFilter = "ISSUED" | "PENDING_REVIEW" | "DRAFT";

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  patient?: { user?: { firstName: string; lastName: string; avatarUrl?: string | null } };
}

export interface DoctorAppointmentParams {
  page?: number;
  limit?: number;
  status?: string;
  kind?: "PHYSICAL" | "ONLINE";
  range?: "today" | "upcoming" | "past";
  manualOnly?: boolean;
  search?: string;
}

export interface DoctorDashboardCounts {
  physRequests: number;
  physToday: number;
  physManual: number;
  ocRequests: number;
  ocUpcoming: number;
  ocToday: number;
  ocOngoing: number;
  consultationsToday: number;
  qaNew: number;
  qaDrafts: number;
}

export interface DoctorSchedules {
  clinicSchedule: ClinicScheduleConfig | null;
  onlineSchedule: OnlineScheduleConfig | null;
  weeklySchedule?: unknown;
}

export interface ScheduleHoliday {
  date: string;
  label?: string;
}

export interface ClinicScheduleConfig {
  days: Record<string, boolean>;
  start: string;
  end: string;
  slotMinutes: number;
  breakStart: string;
  breakEnd: string;
  dailyCapacity: number;
  capacityOverride?: boolean;
  holidays: ScheduleHoliday[];
}

export interface OnlineConsultationTypeConfig {
  on: boolean;
  fee: number;
}

export interface OnlineScheduleConfig {
  days: Record<string, boolean>;
  start: string;
  end: string;
  slotMinutes: number;
  breakStart: string;
  breakEnd: string;
  holidays: ScheduleHoliday[];
  types: {
    video: OnlineConsultationTypeConfig;
    audio: OnlineConsultationTypeConfig;
    chat: OnlineConsultationTypeConfig;
  };
}

export function useDoctorAppointments(params?: DoctorAppointmentParams) {
  return useQuery({
    queryKey: ["doctor-appointments", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Appointment>>("/appointments", { params });
      return data;
    },
  });
}

export interface DoctorAppointmentDetail extends Omit<Appointment, "patient"> {
  updatedAt?: string;
  patient?: {
    id?: string;
    patientNumber?: string | null;
    gender?: string | null;
    dateOfBirth?: string | null;
    address?: string | null;
    user?: {
      id?: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string | null;
      phone?: string | null;
      email?: string;
    };
  };
  auditLogs?: Array<{
    id: string;
    action: string;
    actorName: string;
    createdAt: string;
  }>;
}

export function useDoctorAppointmentDetail(id: string | null) {
  return useQuery({
    queryKey: ["doctor-appointment", id],
    queryFn: async () => {
      const { data } = await api.get<DoctorAppointmentDetail>(`/appointments/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useDoctorDashboardCounts() {
  return useQuery({
    queryKey: ["doctor-dashboard-counts"],
    queryFn: async () => {
      const { data } = await api.get<DoctorDashboardCounts>("/appointments/doctor/counts");
      return data;
    },
    refetchInterval: 60_000,
  });
}

export function useRescheduleAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, scheduledAt, reason }: { id: string; scheduledAt: string; reason?: string }) => {
      const { data } = await api.patch(`/appointments/${id}/reschedule`, { scheduledAt, reason });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-dashboard-counts"] });
    },
  });
}

export function useCreateManualAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      patientId?: string;
      newPatient?: { name: string; phone: string; gender?: string; age?: number };
      scheduledAt: string;
      durationMinutes?: number;
      bookingSource: "WALK_IN" | "PHONE" | "CLINIC_VISIT" | "EMERGENCY";
      reason?: string;
      notes?: string;
    }) => {
      const { data } = await api.post<Appointment>("/appointments/manual", body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-dashboard-counts"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-patients"] });
    },
  });
}

export function useDoctorSchedules() {
  return useQuery({
    queryKey: ["doctor-schedules"],
    queryFn: async () => {
      const { data } = await api.get<DoctorSchedules>("/doctors/me/schedules");
      return data;
    },
  });
}

export function useUpdateDoctorSchedules() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      clinicSchedule?: ClinicScheduleConfig;
      onlineSchedule?: OnlineScheduleConfig;
    }) => {
      const { data } = await api.patch<DoctorSchedules>("/doctors/me/schedules", body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-schedules"] });
    },
  });
}

export function useDoctorNotifications() {
  return useQuery({
    queryKey: ["doctor-notifications"],
    queryFn: async () => {
      const { data } = await api.get<
        Paginated<{
          id: string;
          title: string;
          body: string;
          type?: string;
          data?: { noteId?: string; patientId?: string; doctorId?: string; appointmentId?: string };
          readAt?: string | null;
          createdAt?: string;
        }>
      >("/notifications");
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
    onSuccess: (data: { id?: string; profileSlug?: string | null }) => {
      queryClient.invalidateQueries({ queryKey: ["doctor-profile"] });
      queryClient.invalidateQueries({ queryKey: ["auth-profile"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["doctor", data.id] });
        queryClient.invalidateQueries({ queryKey: ["author", data.id] });
      }
      if (data?.profileSlug) {
        queryClient.invalidateQueries({ queryKey: ["author", data.profileSlug] });
      }
    },
  });
}

export function useUpdateDoctorUser() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: async (body: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      avatarUrl?: string | null;
    }) => {
      const { data } = await api.patch("/users/me", body);
      return data;
    },
    onSuccess: (data) => {
      const current = useAuthStore.getState().user;
      if (data?.id) {
        setUser({
          id: data.id,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          status: data.status ?? current?.status ?? "ACTIVE",
          avatarUrl: data.avatarUrl ?? current?.avatarUrl ?? null,
          phone: data.phone ?? current?.phone ?? null,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["doctor-profile"] });
      queryClient.invalidateQueries({ queryKey: ["auth-profile"] });
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

export function useDoctorPrescriptionList(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: PrescriptionStatusFilter;
  sort?: "newest" | "oldest" | "patient";
}) {
  return useQuery({
    queryKey: ["doctor-prescriptions-list", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Prescription>>("/prescriptions/list", { params });
      return data;
    },
  });
}

export function useDoctorPrescriptionStats() {
  return useQuery({
    queryKey: ["doctor-prescription-stats"],
    queryFn: async () => {
      const { data } = await api.get<PrescriptionStats>("/prescriptions/stats");
      return data;
    },
  });
}

export function useDoctorPrescription(id?: string) {
  return useQuery({
    queryKey: ["doctor-prescription", id],
    queryFn: async () => {
      const { data } = await api.get<Prescription>(`/prescriptions/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useUpdatePrescription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, unknown> }) => {
      const { data } = await api.patch<Prescription>(`/prescriptions/${id}`, body);
      return data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["doctor-prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-prescriptions-list"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-prescription-stats"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-prescription", vars.id] });
    },
  });
}

export function useDeletePrescription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/prescriptions/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-prescriptions-list"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-prescription-stats"] });
    },
  });
}

export function useDuplicatePrescription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/prescriptions/${id}/duplicate`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-prescription-draft"] });
    },
  });
}

export function useMarkPrescriptionCompleted() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<Prescription>(`/prescriptions/${id}/complete`);
      return data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["doctor-prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-prescriptions-list"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-prescription-stats"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-prescription", id] });
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
      const { data } = await api.get<Paginated<BlogPost & { status?: string; viewCount?: number }>>(
        "/blog/manage",
        { params: { authorId, limit: 50, status: "ALL" } },
      );
      return data;
    },
    enabled: !!authorId,
  });
}

export interface CreateBlogPostPayload {
  title: string;
  slug: string;
  subtitle?: string;
  excerpt: string;
  content: string;
  categoryId: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  coverImageCaption?: string;
  specialty?: string;
  tags?: string[];
  summaryPoints?: string[];
  keyTakeaways?: string[];
  references?: Array<{ text: string; url?: string }>;
  glossary?: Array<{ term: string; definition: string }>;
  medicalDisclaimer?: string;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  authorId?: string;
  featured?: boolean;
  pinned?: boolean;
  readTimeMinutes?: number;
  publishedAt?: string;
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateBlogPostPayload) => {
      const { data } = await api.post<BlogPost>("/blog", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-blog"] });
      queryClient.invalidateQueries({ queryKey: ["blog"] });
    },
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
      queryClient.invalidateQueries({ queryKey: ["doctor-questions"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-dashboard-counts"] });
    },
  });
}

export type DoctorQuestionView = "new" | "drafts" | "answered" | "rejected";

export interface DoctorQuestion extends AskDoctorQuestion {
  answerDraft?: string | null;
  rejectReason?: string | null;
  rejectedAt?: string | null;
  helpfulCount?: number;
}

export function useDoctorQuestions(view: DoctorQuestionView, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["doctor-questions", view, params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<DoctorQuestion>>("/ask-doctor/doctor/questions", {
        params: { view, ...params },
      });
      return data;
    },
  });
}

export function useSaveQuestionDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, draft }: { id: string; draft: string }) => {
      const { data } = await api.patch(`/ask-doctor/${id}/draft`, { draft });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-questions"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-dashboard-counts"] });
    },
  });
}

export function useRejectQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data } = await api.patch(`/ask-doctor/${id}/reject`, { reason });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-questions"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-dashboard-counts"] });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, cancelReason }: { id: string; status: string; cancelReason?: string }) => {
      const { data } = await api.patch(`/appointments/${id}/status`, { status, cancelReason });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-dashboard-counts"] });
    },
  });
}

export function usePatientDetail(patientId?: string) {
  return useQuery({
    queryKey: ["doctor-patient-detail", patientId],
    queryFn: async () => {
      const { data } = await api.get<PatientDetail>(`/doctors/me/patients/${patientId}`);
      return data;
    },
    enabled: !!patientId,
  });
}

export function usePatientNotes(patientId?: string, params?: ClinicalNotesListParams) {
  return useQuery({
    queryKey: ["doctor-patient-notes", patientId, params],
    queryFn: async () => {
      const { data } = await api.get<{
        items: PatientClinicalNote[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`/doctors/me/patients/${patientId}/notes`, { params });
      return data;
    },
    enabled: !!patientId,
  });
}

export function usePatientNote(patientId?: string, noteId?: string) {
  return useQuery({
    queryKey: ["doctor-patient-note", patientId, noteId],
    queryFn: async () => {
      const { data } = await api.get<PatientClinicalNote>(
        `/doctors/me/patients/${patientId}/notes/${noteId}`,
      );
      return data;
    },
    enabled: !!patientId && !!noteId,
  });
}

export function useMarkDoctorNoteRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ noteId, patientId }: { noteId: string; patientId: string }) => {
      const { data } = await api.patch(`/doctors/me/patients/notes/${noteId}/read`);
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["doctor-patient-notes", vars.patientId] });
      queryClient.invalidateQueries({ queryKey: ["doctor-patient-note", vars.patientId, vars.noteId] });
      queryClient.invalidateQueries({ queryKey: ["doctor-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function usePatientNoteDraft(patientId?: string) {
  return useQuery({
    queryKey: ["doctor-patient-note-draft", patientId],
    queryFn: async () => {
      const { data } = await api.get<PatientClinicalNote | null>(`/doctors/me/patients/${patientId}/notes/draft`);
      return data;
    },
    enabled: !!patientId,
  });
}

export function useSavePatientNoteDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      patientId,
      body,
    }: {
      patientId: string;
      body: Partial<{
        title: string;
        noteType: string;
        clinicalNotes: string;
        followUpNotes: string;
        privateNotes: string;
        appointmentId: string;
        priority: string;
        attachments: ClinicalNoteAttachment[];
        followUpReminderAt: string;
      }>;
    }) => {
      const { data } = await api.post(`/doctors/me/patients/${patientId}/notes/draft`, body);
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["doctor-patient-note-draft", vars.patientId] });
    },
  });
}

export function useCreatePatientNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      patientId,
      body,
    }: {
      patientId: string;
      body: {
        title: string;
        noteType?: string;
        clinicalNotes: string;
        followUpNotes?: string;
        privateNotes?: string;
        appointmentId?: string;
        priority?: string;
        attachments?: ClinicalNoteAttachment[];
        followUpReminderAt?: string;
      };
    }) => {
      const { data } = await api.post(`/doctors/me/patients/${patientId}/notes`, body);
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["doctor-patient-notes", vars.patientId] });
      queryClient.invalidateQueries({ queryKey: ["doctor-patient-detail", vars.patientId] });
      queryClient.invalidateQueries({ queryKey: ["doctor-patient-note-draft", vars.patientId] });
      queryClient.invalidateQueries({ queryKey: ["doctor-patients"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useUpdatePatientNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      noteId,
      patientId,
      body,
    }: {
      noteId: string;
      patientId: string;
      body: Partial<{
        title: string;
        noteType: string;
        clinicalNotes: string;
        followUpNotes: string;
        privateNotes: string;
        priority: string;
        attachments: ClinicalNoteAttachment[];
        followUpReminderAt: string;
      }>;
    }) => {
      const { data } = await api.patch(`/doctors/me/patients/notes/${noteId}`, body);
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["doctor-patient-notes", vars.patientId] });
      queryClient.invalidateQueries({ queryKey: ["doctor-patient-detail", vars.patientId] });
    },
  });
}

export function useDeletePatientNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ noteId, patientId }: { noteId: string; patientId: string }) => {
      const { data } = await api.delete(`/doctors/me/patients/notes/${noteId}`);
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["doctor-patient-notes", vars.patientId] });
      queryClient.invalidateQueries({ queryKey: ["doctor-patient-detail", vars.patientId] });
    },
  });
}

export function usePatientAlerts(patientId?: string) {
  return useQuery({
    queryKey: ["doctor-patient-alerts", patientId],
    queryFn: async () => {
      const { data } = await api.get<PatientCriticalAlert[]>(`/doctors/me/patients/${patientId}/alerts`);
      return data;
    },
    enabled: !!patientId,
  });
}

export function useCreatePatientAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      patientId,
      body,
    }: {
      patientId: string;
      body: {
        severity: "CRITICAL" | "URGENT" | "STABLE";
        category: string;
        reason: string;
        clinicalNotes?: string;
        attachments?: unknown;
        reviewDate?: string;
        notifyTeam?: boolean;
      };
    }) => {
      const { data } = await api.post(`/doctors/me/patients/${patientId}/alerts`, body);
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["doctor-patient-alerts", vars.patientId] });
      queryClient.invalidateQueries({ queryKey: ["doctor-patient-detail", vars.patientId] });
      queryClient.invalidateQueries({ queryKey: ["doctor-patients"] });
    },
  });
}

export function useResolvePatientAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      alertId,
      patientId,
      details,
    }: {
      alertId: string;
      patientId: string;
      details?: string;
    }) => {
      const { data } = await api.patch(`/doctors/me/patients/alerts/${alertId}/resolve`, { details });
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["doctor-patient-alerts", vars.patientId] });
      queryClient.invalidateQueries({ queryKey: ["doctor-patient-detail", vars.patientId] });
      queryClient.invalidateQueries({ queryKey: ["doctor-patients"] });
    },
  });
}

export function useRemovePatientAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      alertId,
      patientId,
      details,
    }: {
      alertId: string;
      patientId: string;
      details?: string;
    }) => {
      const { data } = await api.patch(`/doctors/me/patients/alerts/${alertId}/remove`, { details });
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["doctor-patient-alerts", vars.patientId] });
      queryClient.invalidateQueries({ queryKey: ["doctor-patient-detail", vars.patientId] });
      queryClient.invalidateQueries({ queryKey: ["doctor-patients"] });
    },
  });
}

export function usePrescriptionDraft(patientId?: string) {
  return useQuery({
    queryKey: ["doctor-prescription-draft", patientId],
    queryFn: async () => {
      const { data } = await api.get<{ id: string; data: Record<string, unknown> } | null>(
        `/prescriptions/draft/${patientId}`,
      );
      return data;
    },
    enabled: !!patientId,
  });
}

export function useSavePrescriptionDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      patientId,
      body,
    }: {
      patientId: string;
      body: { appointmentId?: string; data: Record<string, unknown> };
    }) => {
      const { data } = await api.post(`/prescriptions/draft/${patientId}`, body);
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["doctor-prescription-draft", vars.patientId] });
    },
  });
}

export function useIssuePrescription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      patientId,
      body,
    }: {
      patientId: string;
      body: Record<string, unknown>;
    }) => {
      const { data } = await api.post<Prescription>(`/prescriptions/issue/${patientId}`, body);
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["doctor-prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-prescription-draft", vars.patientId] });
      queryClient.invalidateQueries({ queryKey: ["doctor-patient-detail", vars.patientId] });
      queryClient.invalidateQueries({ queryKey: ["doctor-patient-prescriptions", vars.patientId] });
      queryClient.invalidateQueries({ queryKey: ["doctor-patients"] });
    },
  });
}

export function usePatientPrescriptions(patientId?: string) {
  return useQuery({
    queryKey: ["doctor-patient-prescriptions", patientId],
    queryFn: async () => {
      const { data } = await api.get<Prescription[]>("/prescriptions", { params: { patientId } });
      return data;
    },
    enabled: !!patientId,
  });
}

export interface DoctorVitalItem {
  id: string;
  val: string;
  unit: string;
  label: string;
  badge: string;
  badgeLabel: string;
  recordedAt: string;
}

export interface DoctorHealthToolHistoryItem {
  id: string;
  resultSummary?: string | null;
  notes?: string | null;
  createdAt: string;
  tool: { name: string; iconEmoji?: string | null; slug: string };
}

export function useDoctorHealthVitals() {
  return useQuery({
    queryKey: ["doctor-health-vitals"],
    queryFn: async () => {
      const { data } = await api.get<{ data: DoctorVitalItem[]; lastRecordedAt: string | null }>("/doctors/me/health/vitals");
      return data;
    },
  });
}

export function useDoctorHealthToolHistory(limit = 20) {
  return useQuery({
    queryKey: ["doctor-health-tool-history", limit],
    queryFn: async () => {
      const { data } = await api.get<DoctorHealthToolHistoryItem[]>("/doctors/me/health/tools/history", { params: { limit } });
      return data;
    },
  });
}

export function useCreateDoctorVital() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      type: string;
      value: string;
      unit?: string;
      status?: string;
      notes?: string;
    }) => {
      const { data } = await api.post("/doctors/me/health/vitals", body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-health-vitals"] });
    },
  });
}
