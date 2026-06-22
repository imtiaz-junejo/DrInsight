"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";
import { useAuthStore, type AuthUser } from "@/store/auth.store";

export function AuthHydrator({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setBootstrapped = useAuthStore((state) => state.setBootstrapped);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!accessToken || !refreshToken) {
        clearAuth();
        if (mounted) setBootstrapped(true);
        return;
      }

      try {
        const { data } = await api.get<AuthUser>("/auth/me");
        if (!mounted) return;
        setAuth(data, accessToken, refreshToken);
        setUser(data);
      } catch {
        if (!mounted) return;
        clearAuth();
      } finally {
        if (mounted) setBootstrapped(true);
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [clearAuth, setAuth, setBootstrapped, setUser]);

  return <>{children}</>;
}
