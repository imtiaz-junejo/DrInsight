"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/layout/Logo";
import { api } from "@/lib/api";
import { useAuthStore, type AuthUser } from "@/store/auth.store";

function dashboardForRole(role: AuthUser["role"]) {
  if (role === "DOCTOR") return "/doctor";
  if (role === "ADMIN") return "/admin";
  return "/patient";
}

export function LoginForm() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const setAuth = useAuthStore((state) => state.setAuth);
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
      setError("");
      setSuccess("Login successful! Redirecting...");
      router.replace(dashboardForRole(data.user.role));
    },
    onError: () => {
      setSuccess("");
      setError("Invalid email/password or inactive account.");
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = (fd.get("email") as string).trim();
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
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setSuccess("");
      return;
    }

    setError("");
    loginMutation.mutate({ email, password });
  }

  return (
    <div className="w-full max-w-[440px] rounded-[20px] border border-gray-200 bg-white p-10 shadow-[var(--shadow-lg)] md:p-11">
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>
      <h2 className="font-display text-center text-[1.55rem] font-bold text-gray-900">Welcome Back</h2>
      <p className="mb-6 text-center text-[.84rem] text-gray-500">Sign in to your patient or doctor account</p>

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

      <div className="mb-5 grid grid-cols-2 gap-2.5">
        {["Google", "Facebook"].map((provider) => (
          <button
            key={provider}
            type="button"
            className="flex items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-gray-200 bg-white px-4 py-2.5 text-[.88rem] font-semibold text-gray-700 transition hover:border-blue hover:bg-blue-light hover:text-blue"
          >
            {provider}
          </button>
        ))}
      </div>

      <div className="mb-5 flex items-center gap-3 text-[.8rem] text-gray-400">
        <div className="h-px flex-1 bg-gray-200" />
        or sign in with email
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[.84rem] font-semibold text-gray-700">Email Address</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[.9rem]">✉️</span>
            <Input name="email" type="email" placeholder="you@example.com" className="pl-10" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 flex items-center justify-between text-[.84rem] font-semibold text-gray-700">
            Password
            <Link href="/forgot-password" className="text-[.82rem] font-semibold text-blue">
              Forgot password?
            </Link>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[.9rem]">🔒</span>
            <Input
              name="password"
              type={showPw ? "text" : "password"}
              placeholder="Your password"
              className="pr-10 pl-10"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[.9rem]"
              aria-label="Toggle password visibility"
            >
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-[.84rem] text-gray-600">
          <input type="checkbox" className="h-4 w-4 accent-blue" />
          Keep me signed in for 30 days
        </label>

        <Button type="submit" size="full" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Signing in..." : "Sign In to My Account →"}
        </Button>
      </form>

      <p className="mt-4 text-center text-[.83rem] text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-bold text-blue">
          Create one free
        </Link>
      </p>

      <div className="mt-4 rounded-[10px] border border-gray-200 bg-gray-50 p-3.5 text-[.78rem] leading-relaxed text-gray-500">
        🔒 Your login is protected by 256-bit SSL encryption. DrInsight never shares your personal or medical
        information with third parties.
      </div>
    </div>
  );
}
