"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Appointment, BlogPost, DoctorProfile, Paginated } from "@/services/api-hooks";

export interface PlatformStats {
  doctorCount: number;
  blogCount: number;
  patientCount: number;
  answeredQuestions: number;
  averageRating: number;
}

export interface PendingUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  createdAt: string;
  doctorProfile?: { specialty: string; licenseNumber: string } | null;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  readAt?: string | null;
  createdAt: string;
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ["platform-stats"],
    queryFn: async () => {
      const { data } = await api.get<PlatformStats>("/platform/stats");
      return data;
    },
  });
}

export function useAdminAppointments(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ["admin-appointments", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Appointment>>("/appointments", { params });
      return data;
    },
  });
}

export function usePendingUsers() {
  return useQuery({
    queryKey: ["admin-pending-users"],
    queryFn: async () => {
      const { data } = await api.get<PendingUser[]>("/users/pending");
      return data;
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.patch(`/users/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-users"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.patch(`/appointments/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useAdminDoctors(params?: { page?: number; limit?: number; search?: string; specialty?: string }) {
  return useQuery({
    queryKey: ["admin-doctors", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<DoctorProfile>>("/doctors", { params });
      return data;
    },
  });
}

export function useAdminBlogPosts(params?: { page?: number; limit?: number; search?: string; category?: string }) {
  return useQuery({
    queryKey: ["admin-blog", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<BlogPost & { status?: string }>>("/blog", { params });
      return data;
    },
  });
}

export function useAdminBlogCategories() {
  return useQuery({
    queryKey: ["admin-blog-categories"],
    queryFn: async () => {
      const { data } = await api.get<Array<{ id: string; name: string; slug: string }>>("/blog/categories");
      return data;
    },
  });
}

export function useAdminNotifications(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["admin-notifications", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<NotificationItem>>("/notifications", { params });
      return data;
    },
  });
}

export function useAdminUnreadNotifications() {
  return useQuery({
    queryKey: ["admin-notifications-unread"],
    queryFn: async () => {
      const { data } = await api.get<{ count: number }>("/notifications/unread-count");
      return data;
    },
  });
}
