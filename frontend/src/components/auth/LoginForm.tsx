"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/public/section-heading";
import { FloatingInput } from "@/components/ui/floating-input";
import { AuthSocialButtons } from "@/components/auth/AuthSocialButtons";
import { Logo } from "@/components/layout/Logo";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import { clearOAuthLoadingProvider, resolvePostLoginPath, startOAuth, type OAuthProviderName } from "@/lib/oauth";
import { bookingRegisterUrl, isBookingAuthFlow } from "@/lib/booking-auth";
import { invalidateAuthProfile } from "@/services/patient-api-hooks";
import { useAuthStore, type AuthUser } from "@/store/auth.store";

export function LoginForm() {
  const searchParams = useSearchParams();
  const fromBooking = isBookingAuthFlow(searchParams);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [oauthLoading, setOauthLoading] = useState<OAuthProviderName | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  useEffect(() => {
    clearOAuthLoadingProvider();
    setOauthLoading(null);

    const oauthError = searchParams.get("error");
    if (oauthError) {
      setError(oauthError);
      setSuccess("");
    }
  }, [searchParams]);
  const loginMutation = useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const { data } = await api.post<{
        accessToken: string;
        refreshToken: string;
        user: AuthUser;
      }>("/auth/login", payload);
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      void invalidateAuthProfile(queryClient);
      setError("");
      setSuccess("Login successful! Redirecting...");
      const destination = resolvePostLoginPath(data.user.role, searchParams.get("redirect"));
      // Full navigation ensures proxy receives the freshly-set auth cookie
      window.location.assign(destination);
    },
    onError: (err) => {
      setSuccess("");
      if (isAxiosError(err)) {
        const message = err.response?.data?.message;
        if (Array.isArray(message)) {
          setError(message.join(", "));
          return;
        }
        if (typeof message === "string" && message) {
          setError(message);
          return;
        }
        if (!err.response) {
          setError("Cannot reach the server. Make sure the backend is running on port 4000.");
          return;
        }
      }
      setError("Invalid email/password or inactive account.");
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = (fd.get("email") as string).trim().toLowerCase();
    const password = fd.get("password") as string;

    if (!email || !password) {
      setError("Please fill in all fields.");
      setSuccess("");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      setSuccess("");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setSuccess("");
      return;
    }

    setError("");
    loginMutation.mutate({ email, password });
  }

  function handleOAuth(provider: OAuthProviderName) {
    setError("");
    setSuccess("");
    setOauthLoading(provider);
    startOAuth(provider, searchParams.get("redirect"));
  }

  return (
    <div className="w-full max-w-[420px] rounded-[20px] border border-gray-200 bg-white p-5 shadow-[var(--shadow-lg)] sm:p-7">
      <div className="mb-4 flex justify-center">
        <Logo imgClassName="!h-[3.75rem] !max-h-[3.75rem] !p-0" />
      </div>
      <SectionTitle className="text-center text-[1.35rem]">Welcome Back</SectionTitle>
      <p className="mb-4 text-center text-[.84rem] text-gray-500">Sign in to your patient or doctor account</p>

      {fromBooking && (
        <div className="mb-4 rounded-[10px] border border-[#bfdbfe] bg-[#eff6ff] px-3.5 py-3 text-[.84rem] leading-relaxed text-[#1e40af]">
          Please create a Patient account or sign in to continue booking your consultation.
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-[10px] border border-[#fecaca] bg-[#fef2f2] px-3.5 py-3 text-[.85rem] text-red">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-[10px] border border-[#bbf7d0] bg-[#f0fdf4] px-3.5 py-3 text-[.85rem] text-green">
          {success}
        </div>
      )}

      <AuthSocialButtons
        className="mb-4"
        onOAuth={handleOAuth}
        oauthLoading={oauthLoading}
        disabled={loginMutation.isPending}
      />

      <div className="mb-4 flex items-center gap-3 text-[.8rem] text-gray-400">
        <div className="h-px flex-1 bg-gray-100" />
        or sign in with email
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <FloatingInput
          name="email"
          type="email"
          label="Email Address"
          autoComplete="username email"
        />

        <FloatingInput
          name="password"
          type={showPw ? "text" : "password"}
          label="Password"
          autoComplete="current-password"
          showPasswordToggle
          passwordVisible={showPw}
          onPasswordToggle={() => setShowPw(!showPw)}
        />

        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-[.70rem] text-gray-600">
            <input type="checkbox" className="h-4 w-4 accent-blue" />
            Keep me signed in for 30 days
          </label>
          <Link href="/forgot-password" className="shrink-0 text-[.82rem] font-semibold text-blue">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="full" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Signing in..." : "Sign In to My Account →"}
        </Button>
      </form>

      <p className="mt-3 text-center text-[.83rem] text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href={fromBooking ? bookingRegisterUrl() : "/register"} className="font-bold text-blue">
          Create one free
        </Link>
      </p>

      <div className="mt-3 rounded-[10px] border border-gray-200 bg-gray-50 p-3 text-[.75rem] leading-relaxed text-gray-500">
        🔒 Your login is protected by 256-bit SSL encryption. DrInsight never shares your personal or medical
        information with third parties.
      </div>
    </div>
  );
}
