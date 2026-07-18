"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CONTACT_PHONE } from "@/lib/site-contact";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

const portalLinkClass =
  "ml-4 cursor-pointer border-0 bg-transparent p-0 font-inherit text-[#93c5fd] transition hover:text-white";

export function TopBar() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  async function handleLogout() {
    const refreshToken =
      useAuthStore.getState().refreshToken ??
      (typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null);

    if (refreshToken) {
      try {
        await api.post("/auth/logout", { refreshToken });
      } catch {
        // Still clear local session if the server call fails.
      }
    }

    clearAuth();
    queryClient.clear();
    router.replace("/");
  }

  return (
    <div className="site-top-bar bg-blue-dark py-[.15rem] text-[.8rem] text-[#cbd5e1]">
      <div className="topbar-inner mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3 px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 text-[0.72rem] font-semibold text-[#fca5a5] sm:text-[.8rem]">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" className="shrink-0">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          <span className="truncate">
            Emergency: <strong>115</strong>
            <span className="topbar-emergency-short"> &nbsp;|&nbsp; Helpline: <strong>{CONTACT_PHONE}</strong></span>
          </span>
        </div>
        <div className="shrink-0">
          {/* <Link href="/about" className={portalLinkClass}>
            About
          </Link>
          <Link href="/contact" className={portalLinkClass}>
            Contact
          </Link> */}
          {isAuthenticated ? (
            <button type="button" onClick={() => void handleLogout()} className={portalLinkClass}>
              Portal Logout
            </button>
          ) : (
            <Link href="/login" className={portalLinkClass}>
              Portal Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
