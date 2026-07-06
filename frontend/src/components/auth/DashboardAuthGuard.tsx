"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";

function rolePath(role: string) {
  if (role === "PATIENT") return "/patient";
  if (role === "DOCTOR") return "/doctor";
  if (role === "ADMIN") return "/admin";
  return "/";
}

/** Match `/doctor` and `/doctor/...` but not `/doctors` or `/our-doctors`. */
function matchesPathPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function requiredRole(pathname: string) {
  if (matchesPathPrefix(pathname, "/patient")) return "PATIENT";
  if (matchesPathPrefix(pathname, "/doctor")) return "DOCTOR";
  if (matchesPathPrefix(pathname, "/admin")) return "ADMIN";
  return null;
}

export function DashboardAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);
  const neededRole = requiredRole(pathname);

  useEffect(() => {
    if (!isBootstrapped) return;
    if (!isAuthenticated || !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (neededRole && user.role !== neededRole) {
      router.replace(rolePath(user.role));
    }
  }, [isAuthenticated, isBootstrapped, neededRole, pathname, router, user]);

  if (!isBootstrapped) {
    return (
      <div className="px-6 py-16 text-center text-[.9rem] text-gray-500">
        Loading secure session...
      </div>
    );
  }

  if (!isAuthenticated || !user || (neededRole && user.role !== neededRole)) {
    return (
      <div className="px-6 py-16 text-center text-[.9rem] text-gray-500">
        Redirecting...
      </div>
    );
  }

  return <>{children}</>;
}
