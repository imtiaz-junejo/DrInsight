"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type MeetingStatus = "WAITING" | "LIVE" | "ENDED" | "MISSED" | "CANCELLED";

export interface IceServerConfig {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface MeetingChatMessage {
  id: string;
  meetingId: string;
  senderId: string;
  content: string;
  replyToId?: string | null;
  replyTo?: {
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
  } | null;
  deliveredAt?: string | null;
  seenAt?: string | null;
  createdAt: string;
}

export interface ConsultationContext {
  appointment: Record<string, unknown>;
  patient: Record<string, unknown> | null;
  labOrders: Array<Record<string, unknown>>;
  clinicalNotes: Array<Record<string, unknown>>;
  iceServers: IceServerConfig[];
}

export function useIceConfig() {
  return useQuery({
    queryKey: ["meetings", "ice-config"],
    queryFn: async () => {
      const { data } = await api.get("/meetings/ice-config");
      return data as { iceServers: IceServerConfig[] };
    },
    staleTime: 60_000,
  });
}

export function useConsultationStatus(appointmentId: string, enabled = true) {
  return useQuery({
    queryKey: ["meetings", appointmentId, "status"],
    queryFn: async () => {
      const { data } = await api.get(`/meetings/${appointmentId}/status`);
      return data;
    },
    enabled: enabled && !!appointmentId,
    refetchInterval: 15_000,
  });
}

export function useConsultationContext(appointmentId: string, enabled = true) {
  return useQuery({
    queryKey: ["meetings", appointmentId, "context"],
    queryFn: async () => {
      const { data } = await api.get(`/meetings/${appointmentId}/context`);
      return data as ConsultationContext;
    },
    enabled: enabled && !!appointmentId,
  });
}

export function useStartConsultation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const { data } = await api.post("/meetings/start", { appointmentId });
      return data;
    },
    onSuccess: (_data, appointmentId) => {
      qc.invalidateQueries({ queryKey: ["meetings", appointmentId] });
    },
  });
}

export function useJoinMeeting() {
  return useMutation({
    mutationFn: async (payload: { appointmentId: string; deviceInfo?: Record<string, unknown> }) => {
      const { data } = await api.post("/meetings/join", payload);
      return data;
    },
  });
}

export function useEndConsultation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const { data } = await api.post("/meetings/end", { appointmentId });
      return data;
    },
    onSuccess: (_data, appointmentId) => {
      qc.invalidateQueries({ queryKey: ["meetings", appointmentId] });
    },
  });
}

export function useLeaveMeeting() {
  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const { data } = await api.post("/meetings/leave", { appointmentId });
      return data;
    },
  });
}

export function useMeetingChatHistory(appointmentId: string) {
  return useQuery({
    queryKey: ["meetings", appointmentId, "chat"],
    queryFn: async () => {
      const { data } = await api.get(`/meetings/${appointmentId}/chat`);
      return data as MeetingChatMessage[];
    },
    enabled: !!appointmentId,
  });
}

export function useAutosaveConsultationNote() {
  return useMutation({
    mutationFn: async (payload: { appointmentId: string; title: string; content: string; noteId?: string }) => {
      const { data } = await api.post("/meetings/notes/autosave", payload);
      return data;
    },
  });
}

export function useCreateLabOrder() {
  return useMutation({
    mutationFn: async (payload: {
      appointmentId: string;
      tests: Array<{ name: string; code?: string; notes?: string }>;
      instructions?: string;
      priority?: "ROUTINE" | "URGENT" | "STAT";
    }) => {
      const { data } = await api.post("/meetings/lab-orders", payload);
      return data;
    },
  });
}

export function useAdminMeetingHistory(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["meetings", "admin", "history", page, limit],
    queryFn: async () => {
      const { data } = await api.get("/meetings/admin/history", { params: { page, limit } });
      return data;
    },
  });
}
