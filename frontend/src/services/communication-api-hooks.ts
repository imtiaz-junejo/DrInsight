"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Paginated } from "@/services/api-hooks";

export interface AdminUserRef {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  bodyHtml: string;
  variables: string[];
  status: "ACTIVE" | "DRAFT";
  isEnabled: boolean;
  icon?: string | null;
  createdBy?: AdminUserRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface OtpTemplate {
  id: string;
  name: string;
  purpose: string;
  subject?: string | null;
  message: string;
  expiryMinutes: number;
  otpLength: number;
  senderName: string;
  status: "ACTIVE" | "DRAFT";
  isEnabled: boolean;
  createdBy?: AdminUserRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface OtpStats {
  emailSent: number;
  smsSent: number;
  successRate: number;
  total: number;
}

export interface NotificationCampaign {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  audience: string;
  audienceUserId?: string | null;
  audienceUser?: AdminUserRef | null;
  channels: string[];
  scheduleAt?: string | null;
  expiresAt?: string | null;
  actionLabel?: string | null;
  actionUrl?: string | null;
  status: "DRAFT" | "SCHEDULED" | "SENT" | "ARCHIVED";
  totalSent: number;
  delivered: number;
  readCount: number;
  failed: number;
  createdBy?: AdminUserRef | null;
  sentAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationCampaignStats {
  totalSent: number;
  delivered: number;
  readCount: number;
  failed: number;
  deliveryRate: number;
  emailCount: number;
  smsPushCount: number;
  emailShare: number;
  smsPushShare: number;
}

export function useAdminEmailTemplates(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "active" | "draft";
}) {
  return useQuery({
    queryKey: ["admin-email-templates", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<EmailTemplate>>("/communication/email-templates", { params });
      return data;
    },
  });
}

export function useCreateEmailTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<EmailTemplate>) => {
      const { data } = await api.post<EmailTemplate>("/communication/email-templates", body);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-email-templates"] }),
  });
}

export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<EmailTemplate> & { id: string }) => {
      const { data } = await api.patch<EmailTemplate>(`/communication/email-templates/${id}`, body);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-email-templates"] }),
  });
}

export function useDeleteEmailTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/communication/email-templates/${id}`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-email-templates"] }),
  });
}

export function useDuplicateEmailTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<EmailTemplate>(`/communication/email-templates/${id}/duplicate`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-email-templates"] }),
  });
}

export function useUpdateEmailTemplateStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      const { data } = await api.patch(`/communication/email-templates/${id}/status`, { isEnabled });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-email-templates"] }),
  });
}

export function usePreviewEmailTemplate() {
  return useMutation({
    mutationFn: async (body: { subject?: string; bodyHtml?: string; variables?: Record<string, string> }) => {
      const { data } = await api.post<{ subject: string; bodyHtml: string }>(
        "/communication/email-templates/preview",
        body,
      );
      return data;
    },
  });
}

export function useAdminOtpTemplates(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "active" | "draft";
  purpose?: string;
}) {
  return useQuery({
    queryKey: ["admin-otp-templates", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<OtpTemplate>>("/communication/otp-templates", { params });
      return data;
    },
  });
}

export function useOtpTemplateStats() {
  return useQuery({
    queryKey: ["admin-otp-template-stats"],
    queryFn: async () => {
      const { data } = await api.get<OtpStats>("/communication/otp-templates/stats");
      return data;
    },
  });
}

export function useCreateOtpTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<OtpTemplate>) => {
      const { data } = await api.post<OtpTemplate>("/communication/otp-templates", body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-otp-templates"] });
      queryClient.invalidateQueries({ queryKey: ["admin-otp-template-stats"] });
    },
  });
}

export function useUpdateOtpTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<OtpTemplate> & { id: string }) => {
      const { data } = await api.patch<OtpTemplate>(`/communication/otp-templates/${id}`, body);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-otp-templates"] }),
  });
}

export function useDeleteOtpTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/communication/otp-templates/${id}`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-otp-templates"] }),
  });
}

export function useUpdateOtpTemplateStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      const { data } = await api.patch(`/communication/otp-templates/${id}/status`, { isEnabled });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-otp-templates"] }),
  });
}

export function usePreviewOtpTemplate() {
  return useMutation({
    mutationFn: async ({ id, message }: { id: string; message: string }) => {
      const { data } = await api.post<{ message: string }>(`/communication/otp-templates/${id}/preview`, { message });
      return data;
    },
  });
}

export function useTestSendOtpTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, email, userName }: { id: string; email: string; userName?: string }) => {
      const { data } = await api.post(`/communication/otp-templates/${id}/test-send`, { email, userName });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-otp-template-stats"] }),
  });
}

export function useAdminNotificationCampaigns(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  audience?: string;
  channel?: string;
}) {
  return useQuery({
    queryKey: ["admin-notification-campaigns", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<NotificationCampaign>>("/communication/notification-campaigns", {
        params,
      });
      return data;
    },
  });
}

export function useNotificationCampaignStats() {
  return useQuery({
    queryKey: ["admin-notification-campaign-stats"],
    queryFn: async () => {
      const { data } = await api.get<NotificationCampaignStats>("/communication/notification-campaigns/stats");
      return data;
    },
  });
}

export function useCreateNotificationCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<NotificationCampaign>) => {
      const { data } = await api.post<NotificationCampaign>("/communication/notification-campaigns", body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notification-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["admin-notification-campaign-stats"] });
    },
  });
}

export function useUpdateNotificationCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<NotificationCampaign> & { id: string }) => {
      const { data } = await api.patch<NotificationCampaign>(`/communication/notification-campaigns/${id}`, body);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-notification-campaigns"] }),
  });
}

export function useDeleteNotificationCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/communication/notification-campaigns/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notification-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["admin-notification-campaign-stats"] });
    },
  });
}

export function useDuplicateNotificationCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<NotificationCampaign>(`/communication/notification-campaigns/${id}/duplicate`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-notification-campaigns"] }),
  });
}

export function useSendNotificationCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/communication/notification-campaigns/${id}/send`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notification-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["admin-notification-campaign-stats"] });
    },
  });
}

export function useBulkDeleteNotificationCampaigns() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { data } = await api.post("/communication/notification-campaigns/bulk-delete", { ids });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notification-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["admin-notification-campaign-stats"] });
    },
  });
}

export function useBulkArchiveNotificationCampaigns() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { data } = await api.post("/communication/notification-campaigns/bulk-archive", { ids });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-notification-campaigns"] }),
  });
}

export function useBulkSendNotificationCampaigns() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { data } = await api.post("/communication/notification-campaigns/bulk-send", { ids });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notification-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["admin-notification-campaign-stats"] });
    },
  });
}
