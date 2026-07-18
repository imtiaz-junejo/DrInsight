"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CompleteProfilePayload, ProfileCompletenessResponse } from "@/lib/profile-completeness";
import { useAuthStore } from "@/store/auth.store";

export const profileCompletenessQueryKey = ["profile-completeness"] as const;
export const emailVerificationStatusQueryKey = ["email-verification-status"] as const;

export interface EmailVerificationStatus {
  verified: boolean;
  email: string;
  pending: boolean;
  cooldownSeconds: number;
}

export function useProfileCompleteness(options?: { enabled?: boolean }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: profileCompletenessQueryKey,
    queryFn: async () => {
      const { data } = await api.get<ProfileCompletenessResponse>("/auth/profile-completeness");
      return data;
    },
    enabled: (options?.enabled ?? true) && isAuthenticated,
    staleTime: 0,
  });
}

export function useEmailVerificationStatus(options?: { enabled?: boolean }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: emailVerificationStatusQueryKey,
    queryFn: async () => {
      const { data } = await api.get<EmailVerificationStatus>("/auth/email-verification/status");
      return data;
    },
    enabled: (options?.enabled ?? true) && isAuthenticated,
    staleTime: 0,
    refetchInterval: (query) => (query.state.data?.verified ? false : 15000),
  });
}

export function useSendEmailVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{
        message: string;
        verified: boolean;
        cooldownSeconds: number;
      }>("/auth/email-verification/send");
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: emailVerificationStatusQueryKey });
      void queryClient.invalidateQueries({ queryKey: profileCompletenessQueryKey });
    },
  });
}

export function useCompleteProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (payload: CompleteProfilePayload) => {
      const { data } = await api.patch<ProfileCompletenessResponse>("/auth/complete-profile", payload);
      return data;
    },
    onSuccess: (data) => {
      setUser({
        id: data.profile.id,
        email: data.profile.email,
        firstName: data.profile.firstName,
        lastName: data.profile.lastName,
        role: data.profile.role as "ADMIN" | "DOCTOR" | "PATIENT",
        status: data.profile.status,
        avatarUrl: data.profile.avatarUrl,
        phone: data.profile.phone,
      });
      void queryClient.invalidateQueries({ queryKey: profileCompletenessQueryKey });
      void queryClient.invalidateQueries({ queryKey: ["auth-profile"] });
    },
  });
}
