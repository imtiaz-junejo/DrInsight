import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface NewsletterStats {
  total: number;
  active: number;
  inactive: number;
  campaignsSent: number;
  lastCampaign: {
    sentAt: string;
    subject: string;
    recipientCount: number;
  } | null;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  source?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface NewsletterCampaign {
  id: string;
  subject: string;
  previewText?: string | null;
  bodyHtml: string;
  bodyText?: string | null;
  articleLink?: string | null;
  status: "DRAFT" | "SCHEDULED" | "SENT";
  audience: "ALL" | "ACTIVE";
  scheduledAt?: string | null;
  sentAt?: string | null;
  recipientCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: string; firstName: string; lastName: string } | null;
}

export function useNewsletterStats() {
  return useQuery({
    queryKey: ["admin-newsletter-stats"],
    queryFn: async () => {
      const { data } = await api.get<NewsletterStats>("/newsletter/stats");
      return data;
    },
  });
}

export function useNewsletterSubscribers(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive" | "all";
}) {
  return useQuery({
    queryKey: ["admin-newsletter-subscribers", params],
    queryFn: async () => {
      const { data } = await api.get<{
        data: NewsletterSubscriber[];
        meta: { total: number; page: number; limit: number; totalPages: number };
      }>("/newsletter/subscribers", { params });
      return data;
    },
  });
}

export function useNewsletterSubscriber(id: string | null) {
  return useQuery({
    queryKey: ["admin-newsletter-subscriber", id],
    queryFn: async () => {
      const { data } = await api.get<NewsletterSubscriber>(`/newsletter/subscribers/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useAddNewsletterSubscriber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { email: string; source?: string }) => {
      const { data } = await api.post<NewsletterSubscriber>("/newsletter/subscribers", body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-newsletter-subscribers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-newsletter-stats"] });
    },
  });
}

export function useDeleteNewsletterSubscriber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/newsletter/subscribers/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-newsletter-subscribers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-newsletter-stats"] });
    },
  });
}

export async function exportNewsletterSubscribersCsv() {
  const response = await api.get("/newsletter/subscribers/export", { responseType: "blob" });
  const blob = new Blob([response.data], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "drinsight-subscribers.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function useNewsletterCampaigns(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ["admin-newsletter-campaigns", params],
    queryFn: async () => {
      const { data } = await api.get<{
        data: NewsletterCampaign[];
        meta: { total: number; page: number; limit: number; totalPages: number };
      }>("/newsletter/campaigns", { params });
      return data;
    },
  });
}

export function useCreateNewsletterCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<NewsletterCampaign> & { subject: string; bodyHtml: string }) => {
      const { data } = await api.post<NewsletterCampaign>("/newsletter/campaigns", body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-newsletter-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["admin-newsletter-stats"] });
    },
  });
}

export function useUpdateNewsletterCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<NewsletterCampaign> & { id: string }) => {
      const { data } = await api.patch<NewsletterCampaign>(`/newsletter/campaigns/${id}`, body);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-newsletter-campaigns"] }),
  });
}

export function useDeleteNewsletterCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/newsletter/campaigns/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-newsletter-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["admin-newsletter-stats"] });
    },
  });
}

export function useSendNewsletterCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<NewsletterCampaign>(`/newsletter/campaigns/${id}/send`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-newsletter-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["admin-newsletter-stats"] });
    },
  });
}

export function useScheduleNewsletterCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, scheduledAt }: { id: string; scheduledAt: string }) => {
      const { data } = await api.post<NewsletterCampaign>(`/newsletter/campaigns/${id}/schedule`, {
        scheduledAt,
      });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-newsletter-campaigns"] }),
  });
}
