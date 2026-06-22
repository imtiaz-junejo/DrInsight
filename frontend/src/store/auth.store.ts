"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "DOCTOR" | "PATIENT";
  status: string;
  avatarUrl?: string | null;
  phone?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isBootstrapped: boolean;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setUser: (user: AuthUser) => void;
  setBootstrapped: (value: boolean) => void;
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isBootstrapped: false,
      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          setCookie("drinsight_access", accessToken, 60 * 15);
          setCookie("drinsight_role", user.role, 60 * 60 * 24 * 7);
        }
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },
      clearAuth: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          deleteCookie("drinsight_access");
          deleteCookie("drinsight_role");
        }
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
      setUser: (user) => {
        if (typeof window !== "undefined") {
          setCookie("drinsight_role", user.role, 60 * 60 * 24 * 7);
        }
        set({ user, isAuthenticated: true });
      },
      setBootstrapped: (value) => set({ isBootstrapped: value }),
    }),
    { name: "drinsight-auth", partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }) },
  ),
);
