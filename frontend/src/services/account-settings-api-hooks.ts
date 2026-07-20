"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { UserAccountSettings } from "@/lib/account-settings";

export function useAccountSettings() {
  return useQuery({
    queryKey: ["account-settings"],
    queryFn: async () => {
      const { data } = await api.get<UserAccountSettings>("/users/me/account-settings");
      return data;
    },
  });
}

export function useUpdateAccountSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<UserAccountSettings>) => {
      const { data } = await api.patch<UserAccountSettings>("/users/me/account-settings", body);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["account-settings"], data);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (body: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
      const { data } = await api.post<{ message: string }>("/auth/change-password", body);
      return data;
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async (body: { password: string; confirmation: string }) => {
      const { data } = await api.delete<{ message: string }>("/users/me/account", { data: body });
      return data;
    },
  });
}
