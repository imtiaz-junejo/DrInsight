"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Appointment, Paginated } from "@/services/api-hooks";

export function useDoctorAppointments(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ["doctor-appointments", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Appointment>>("/appointments", { params });
      return data;
    },
  });
}

export function useDoctorNotifications() {
  return useQuery({
    queryKey: ["doctor-notifications"],
    queryFn: async () => {
      const { data } = await api.get<Paginated<{ id: string; title: string; body: string; readAt?: string | null }>>(
        "/notifications",
      );
      return data;
    },
  });
}
