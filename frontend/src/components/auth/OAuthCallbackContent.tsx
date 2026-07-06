"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import {
  clearOAuthLoadingProvider,
  consumeOAuthRedirect,
  resolvePostLoginPath,
} from "@/lib/oauth";
import { useAuthStore, type AuthUser } from "@/store/auth.store";

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [message, setMessage] = useState("Completing sign in...");
  const exchangeStarted = useRef(false);

  useEffect(() => {
    let active = true;

    async function completeOAuth() {
      if (exchangeStarted.current) return;
      exchangeStarted.current = true;
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        clearOAuthLoadingProvider();
        if (!active) return;
        setMessage("Social sign-in failed. Redirecting to login...");
        router.replace(`/login?error=${encodeURIComponent(error)}`);
        return;
      }

      if (!code) {
        clearOAuthLoadingProvider();
        if (!active) return;
        setMessage("Missing OAuth session. Redirecting to login...");
        router.replace("/login?error=oauth_missing_code");
        return;
      }

      try {
        const { data } = await api.post<{
          accessToken: string;
          refreshToken: string;
          user: AuthUser;
        }>("/auth/oauth/exchange", { code });

        if (!active) return;

        setAuth(data.user, data.accessToken, data.refreshToken);
        clearOAuthLoadingProvider();

        const redirect = consumeOAuthRedirect();
        const destination = resolvePostLoginPath(data.user.role, redirect);
        window.location.assign(destination);
      } catch (err) {
        clearOAuthLoadingProvider();
        if (!active) return;

        let errorMessage = "Social sign-in failed. Please try again.";
        if (isAxiosError(err)) {
          const responseMessage = err.response?.data?.message;
          if (typeof responseMessage === "string" && responseMessage) {
            errorMessage = responseMessage;
          } else if (Array.isArray(responseMessage)) {
            errorMessage = responseMessage.join(", ");
          }
        }

        router.replace(`/login?error=${encodeURIComponent(errorMessage)}`);
      }
    }

    completeOAuth();

    return () => {
      active = false;
    };
  }, [router, searchParams, setAuth]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-[20px] border border-gray-200 bg-white p-8 text-center shadow-[var(--shadow-lg)]">
        <p className="text-[.95rem] text-gray-600">{message}</p>
      </div>
    </div>
  );
}

export function OAuthCallbackPageContent() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center px-6 py-16">
          <div className="w-full max-w-md rounded-[20px] border border-gray-200 bg-white p-8 text-center shadow-[var(--shadow-lg)]">
            <p className="text-[.95rem] text-gray-600">Completing sign in...</p>
          </div>
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
