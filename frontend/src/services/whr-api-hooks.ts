"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type WhrToolType = "PREGNANCY" | "OVULATION" | "PERIOD";

export interface WhrUserSubscription {
  tool: WhrToolType;
  enabled: boolean;
  status: string | null;
  reminderDate: string | null;
  predictionJson: Record<string, unknown> | null;
  email: string;
}

export interface WhrDashboardStats {
  users: number;
  pregUsers: number;
  ovUsers: number;
  perUsers: number;
  sentToday: number;
  scheduled: number;
  failed: number;
  pending: number;
  lastRun: string;
  nextRun: string;
  settings: WhrSettings;
}

export interface WhrSettings {
  globalEnabled: boolean;
  pregnancyEnabled: boolean;
  ovulationEnabled: boolean;
  periodEnabled: boolean;
  queueEnabled: boolean;
  retryEnabled: boolean;
  senderEmail: string;
  senderName: string;
  ovulationDaysBefore: number;
  periodDaysBefore: number;
  retryAttempts: number;
}

export interface WhrSubscriptionRow {
  id: string;
  email: string;
  patient: string;
  tool: WhrToolType;
  added: string;
  enabled: boolean;
  source: string;
  status?: string;
  cycleKey?: string | null;
}

export interface WhrPublicSubscription {
  id: string;
  email: string;
  tool: WhrToolType;
  enabled: boolean;
  status: string;
  cycleKey: string | null;
  reminderDate: string | null;
  predictionJson: Record<string, unknown> | null;
}

export interface PregnancyScheduleRow {
  id: string;
  weekRange: string;
  title: string;
  subject: string;
  bodyHtml: string;
  tests?: string | null;
  visitReminder?: string | null;
  careInstructions?: string | null;
  enabled: boolean;
  displayOrder: number;
}

export interface WhrLogRow {
  id: string;
  patientName?: string | null;
  email: string;
  tool: WhrToolType;
  emailType: string;
  scheduledAt: string;
  sentAt?: string | null;
  status: string;
  errorMessage?: string | null;
}

const TOOL_API: Record<string, WhrToolType> = {
  pregnancy: "PREGNANCY",
  ovulation: "OVULATION",
  period: "PERIOD",
};

export function whrToolFromKey(key: string): WhrToolType {
  return TOOL_API[key] ?? "PREGNANCY";
}

export function useMyWhrSubscriptions() {
  return useQuery({
    queryKey: ["my-whr-subscriptions"],
    queryFn: async () => {
      const { data } = await api.get<WhrUserSubscription[]>("/me/womens-health-reminders");
      return data;
    },
    refetchInterval: 30_000,
  });
}

export function useToggleMyWhrSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { tool: WhrToolType; enabled: boolean }) => {
      const { data } = await api.patch("/me/womens-health-reminders/toggle", body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-whr-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-whr-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-whr-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["public-whr-status"] });
    },
  });
}

export function useSubscribeWhrReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      tool: WhrToolType;
      email: string;
      cycleKey?: string;
      reminderDate?: string;
      predictionJson?: Record<string, unknown>;
    }) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      const path = token
        ? "/me/womens-health-reminders/subscribe"
        : "/public/womens-health-reminders/subscribe";
      const { data } = await api.post(path, body);
      return data as { subscription: unknown; duplicate: boolean };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["my-whr-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-whr-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-whr-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin-whr-logs"] });
      queryClient.invalidateQueries({ queryKey: ["public-whr-status", variables.email.trim().toLowerCase()] });
    },
  });
}

export function usePublicWhrStatus(email: string | null) {
  const normalized = email?.trim().toLowerCase() ?? "";
  const enabled = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
  return useQuery({
    queryKey: ["public-whr-status", normalized],
    enabled,
    queryFn: async () => {
      const { data } = await api.get<WhrPublicSubscription[]>("/public/womens-health-reminders/status", {
        params: { email: normalized },
      });
      return data;
    },
    staleTime: 30_000,
    refetchInterval: 15_000,
  });
}

export function useUnsubscribeWhrReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { email: string; tool: WhrToolType }) => {
      const { data } = await api.post("/public/womens-health-reminders/unsubscribe", body);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["my-whr-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-whr-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-whr-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["public-whr-status", variables.email.trim().toLowerCase()] });
    },
  });
}

export function useWhrDashboard() {
  return useQuery({
    queryKey: ["admin-whr-dashboard"],
    queryFn: async () => {
      const { data } = await api.get<WhrDashboardStats>("/site-admin/womens-health-reminders/dashboard");
      return data;
    },
    refetchInterval: 30_000,
  });
}

export function useWhrSubscriptions() {
  return useQuery({
    queryKey: ["admin-whr-subscriptions"],
    queryFn: async () => {
      const { data } = await api.get<WhrSubscriptionRow[]>("/site-admin/womens-health-reminders/subscriptions");
      return data;
    },
    refetchInterval: 30_000,
  });
}

export function useWhrSettings() {
  return useQuery({
    queryKey: ["admin-whr-settings"],
    queryFn: async () => {
      const { data } = await api.get<WhrSettings & { ovulationTemplate?: Record<string, string>; periodTemplate?: Record<string, string> }>(
        "/site-admin/womens-health-reminders/settings",
      );
      return data;
    },
  });
}

export function useUpdateWhrSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<WhrSettings>) => {
      const { data } = await api.patch("/site-admin/womens-health-reminders/settings", body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-whr-settings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-whr-dashboard"] });
    },
  });
}

export function useWhrSchedules() {
  return useQuery({
    queryKey: ["admin-whr-schedules"],
    queryFn: async () => {
      const { data } = await api.get<PregnancyScheduleRow[]>("/site-admin/womens-health-reminders/schedules");
      return data;
    },
  });
}

export function useCreateWhrSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<PregnancyScheduleRow>) => {
      const { data } = await api.post("/site-admin/womens-health-reminders/schedules", body);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-whr-schedules"] }),
  });
}

export function useUpdateWhrSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<PregnancyScheduleRow> & { id: string }) => {
      const { data } = await api.patch(`/site-admin/womens-health-reminders/schedules/${id}`, body);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-whr-schedules"] }),
  });
}

export function useToggleWhrSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/site-admin/womens-health-reminders/schedules/${id}/toggle`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-whr-schedules"] }),
  });
}

export function useDeleteWhrSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/site-admin/womens-health-reminders/schedules/${id}`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-whr-schedules"] }),
  });
}

export function useWhrTemplates() {
  return useQuery({
    queryKey: ["admin-whr-templates"],
    queryFn: async () => {
      const { data } = await api.get<{
        ovulation: Record<string, string>;
        period: Record<string, string>;
        pregnancy: Array<{ id: string; weekRange: string; title: string; subject: string; bodyHtml: string; enabled: boolean }>;
      }>("/site-admin/womens-health-reminders/templates");
      return data;
    },
  });
}

export function useSaveWhrTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { kind: "ovulation" | "period" | "schedule"; id?: string; subject: string; body: string }) => {
      if (body.kind === "ovulation") {
        const { data } = await api.put("/site-admin/womens-health-reminders/templates/ovulation", {
          subject: body.subject,
          body: body.body,
        });
        return data;
      }
      if (body.kind === "period") {
        const { data } = await api.put("/site-admin/womens-health-reminders/templates/period", {
          subject: body.subject,
          body: body.body,
        });
        return data;
      }
      const { data } = await api.put(`/site-admin/womens-health-reminders/templates/schedules/${body.id}`, {
        subject: body.subject,
        bodyHtml: body.body,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-whr-templates"] });
      queryClient.invalidateQueries({ queryKey: ["admin-whr-schedules"] });
    },
  });
}

export function useWhrLogs(params?: { tool?: string; status?: string; date?: string; q?: string }) {
  return useQuery({
    queryKey: ["admin-whr-logs", params],
    queryFn: async () => {
      const { data } = await api.get<WhrLogRow[]>("/site-admin/womens-health-reminders/logs", { params });
      return data;
    },
  });
}

export function useAdminToggleWhrSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { email: string; tool: WhrToolType; enabled: boolean }) => {
      const { data } = await api.patch("/site-admin/womens-health-reminders/subscriptions/toggle", body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-whr-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-whr-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["public-whr-status"] });
      queryClient.invalidateQueries({ queryKey: ["my-whr-subscriptions"] });
    },
  });
}

export function useRunWhrScheduler() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/site-admin/womens-health-reminders/scheduler/run");
      return data as { queued: number; retried: number; duplicates: number };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-whr-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin-whr-logs"] });
    },
  });
}

export function useRetryWhrLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/site-admin/womens-health-reminders/logs/${id}/retry`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-whr-logs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-whr-dashboard"] });
    },
  });
}
