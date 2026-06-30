"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AuthLeftPanel } from "@/components/auth/AuthLeftPanel";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore, type AuthUser } from "@/store/auth.store";

type RegisterResponse =
  | { accessToken: string; refreshToken: string; user: AuthUser }
  | { requiresApproval: true; message: string; user: AuthUser };

const loginFeatures = [
  { icon: "🔖", title: "Save Articles & Guides", desc: "Bookmark any article for quick access anytime" },
  { icon: "💬", title: "Ask the Doctor", desc: "Submit questions and track responses from specialists" },
  { icon: "📅", title: "Book Consultations", desc: "Schedule video, phone, or chat with our doctors" },
  { icon: "📊", title: "Health Dashboard", desc: "Track your health tool results and history" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<"patient" | "physician" | "">("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const registerMutation = useMutation({
    mutationFn: async (payload: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: "PATIENT" | "DOCTOR";
      specialty?: string;
      licenseNumber?: string;
    }) => {
      const { data } = await api.post<RegisterResponse>("/auth/register", payload);
      return data;
    },
    onSuccess: (data) => {
      if ("requiresApproval" in data && data.requiresApproval) {
        setSuccess(true);
        setError("");
        return;
      }
      if (!("accessToken" in data) || !data.accessToken) {
        setError("Account created but sign-in failed. Please try logging in.");
        return;
      }
      setAuth(data.user, data.accessToken, data.refreshToken);
      setSuccess(true);
      router.replace(data.user.role === "DOCTOR" ? "/doctor" : "/patient");
    },
    onError: (err) => {
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
      setError("Unable to create account. Check your details and try again.");
    },
  });

  const leftContent =
    accountType === "physician" ? (
      <>
        <div className="mb-8 flex flex-col gap-3">
          {[
            ["✍️", "Publish Articles", "Reach 500,000+ readers with your expertise"],
            ["🔬", "Review & Shape Content", "Peer-review articles in your specialty"],
            ["💬", "Answer Patient Questions", "Respond to Ask the Doctor queries"],
            ["🎓", "CPD/CME Recognition", "Receive recognition letters for contributions"],
          ].map(([icon, title, desc]) => (
            <div key={title as string} className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/10 p-3.5">
              <span className="text-xl">{icon}</span>
              <div>
                <div className="text-[.85rem] font-semibold">{title}</div>
                <div className="text-[.75rem] opacity-80">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </>
    ) : (
      <div className="mb-8 flex flex-col gap-3">
        {loginFeatures.map((f) => (
          <div key={f.title} className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/10 p-3.5">
            <span className="text-xl">{f.icon}</span>
            <div>
              <div className="text-[.85rem] font-semibold">{f.title}</div>
              <div className="text-[.75rem] opacity-80">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    );

  function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (step < 2) {
      if (!accountType) {
        setError("Please select an account type.");
        return;
      }
      setStep(2);
      return;
    }
    const fd = new FormData(e.currentTarget);
    const firstName = String(fd.get("firstName") || "").trim();
    const lastName = String(fd.get("lastName") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");
    if (!firstName || !lastName || !email || password.length < 8) {
      setError("Please complete all required fields.");
      return;
    }
    registerMutation.mutate({
      firstName,
      lastName,
      email,
      password,
      role: accountType === "physician" ? "DOCTOR" : "PATIENT",
      specialty: accountType === "physician" ? "General Medicine" : undefined,
      licenseNumber: accountType === "physician" ? `PENDING-${Date.now()}` : undefined,
    });
  }

  return (
    <>
      <Breadcrumb items={[{ label: "Login", href: "/login" }, { label: "Create Account" }]} />
      <div className="grid min-h-[calc(100vh-112px)] lg:grid-cols-2">
        <AuthLeftPanel
          eyebrow={
            accountType === "physician"
              ? "PHYSICIAN ACCOUNT"
              : accountType === "patient"
                ? "FREE PATIENT ACCOUNT"
                : "FREE ACCOUNT — NO CREDIT CARD REQUIRED"
          }
          title={
            accountType === "physician" ? (
              <>
                Join Our <span className="text-[#93c5fd]">Expert Medical Network</span>
              </>
            ) : (
              <>
                Join <span className="text-[#93c5fd]">500,000+</span> Informed Patients
              </>
            )
          }
          description={
            accountType === "physician"
              ? "Connect with half a million patients and build your global medical reputation."
              : "Access trusted medical information, expert consultations, and powerful health tools — all in one place."
          }
        >
          {leftContent}
          <div className="flex flex-wrap gap-6 text-center">
            {[
              ["500K+", "Active patients"],
              ["200+", "Specialist doctors"],
              ["Free", "Always free to join"],
            ].map(([num, label]) => (
              <div key={label as string}>
                <div className="font-display text-2xl font-bold">{num}</div>
                <div className="text-[.72rem] opacity-80">{label}</div>
              </div>
            ))}
          </div>
        </AuthLeftPanel>

        <div className="flex items-center justify-center bg-gray-50 px-6 py-10">
          <div className="w-full max-w-[520px] rounded-[20px] border border-gray-200 bg-white p-8 shadow-[var(--shadow-lg)] md:p-10">
            {!success ? (
              <>
                <div className="mb-6 flex justify-center">
                  <Logo />
                </div>

                <div className="mb-8 flex items-center justify-between gap-2">
                  {[1, 2].map((s) => (
                    <div key={s} className="flex flex-1 items-center gap-2">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                          step >= s ? "bg-blue text-white" : "bg-gray-100 text-gray-400",
                        )}
                      >
                        {step > s ? "✓" : s}
                      </div>
                      <span className="hidden text-[.75rem] font-medium text-gray-600 sm:inline">
                        {s === 1 ? "Account Type" : "Your Details"}
                      </span>
                      {s === 1 && <div className={cn("h-0.5 flex-1", step > 1 ? "bg-blue" : "bg-gray-200")} />}
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="mb-4 rounded-[10px] border border-[#fecaca] bg-[#fef2f2] px-3.5 py-3 text-[.85rem] text-red">
                    ⚠️ {error}
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                  {step === 1 && (
                    <>
                      <h2 className="font-display text-[1.4rem] font-bold text-gray-900">Create Your Account</h2>
                      <p className="text-[.84rem] text-gray-500">Choose how you&apos;ll be using DrInsight</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {(
                          [
                            ["patient", "🏥", "Register as PATIENT", "I'm seeking medical info or consultations"],
                            ["physician", "👨‍⚕️", "Register as PHYSICIAN", "I'm a licensed healthcare professional"],
                          ] as const
                        ).map(([type, icon, title, desc]) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setAccountType(type)}
                            className={cn(
                              "rounded-xl border-[1.5px] p-5 text-left transition",
                              accountType === type
                                ? "border-blue bg-blue-light"
                                : "border-gray-200 hover:border-blue-mid",
                            )}
                          >
                            <div className="mb-2 text-2xl">{icon}</div>
                            <div className="text-[.82rem] font-bold text-gray-900">{title}</div>
                            <div className="text-[.72rem] text-gray-500">{desc}</div>
                          </button>
                        ))}
                      </div>
                      <Button type="submit" size="full">
                        Continue with Email →
                      </Button>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <h2 className="font-display text-[1.4rem] font-bold text-gray-900">Personal Information</h2>
                      <p className="text-[.84rem] text-gray-500">Tell us a little about yourself</p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-[.84rem] font-semibold text-gray-700">First Name</label>
                          <Input required name="firstName" placeholder="John" />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-[.84rem] font-semibold text-gray-700">Last Name</label>
                          <Input required name="lastName" placeholder="Smith" />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[.84rem] font-semibold text-gray-700">Email Address</label>
                        <Input required name="email" type="email" placeholder="john@example.com" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[.84rem] font-semibold text-gray-700">Password</label>
                        <Input required name="password" type="password" placeholder="Create a strong password" minLength={8} />
                      </div>
                      <label className="flex items-start gap-2 text-[.82rem] text-gray-600">
                        <input type="checkbox" required className="mt-1 accent-blue" />
                        I agree to the{" "}
                        <Link href="/terms-conditions" className="font-semibold text-blue">
                          Terms & Conditions
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy-policy" className="font-semibold text-blue">
                          Privacy Policy
                        </Link>
                      </label>
                      <div className="flex gap-3">
                        <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                          ← Back
                        </Button>
                        <Button type="submit" size="full" disabled={registerMutation.isPending}>
                          {registerMutation.isPending ? "Creating account..." : "🎉 Create My Free Account"}
                        </Button>
                      </div>
                    </>
                  )}
                </form>

                <p className="mt-4 text-center text-[.83rem] text-gray-500">
                  Already have an account?{" "}
                  <Link href="/login" className="font-bold text-blue">
                    Sign in here
                  </Link>
                </p>
              </>
            ) : (
              <div className="py-6 text-center">
                <div className="mb-4 text-5xl">✅</div>
                <h3 className="font-display mb-3 text-[1.5rem] font-bold">Account Created Successfully!</h3>
                <p className="mb-6 text-[.9rem] text-gray-500">
                  {accountType === "physician"
                    ? "Your physician account was submitted. An admin will review and approve it before you can sign in."
                    : "Welcome to DrInsight! You can now sign in and access your dashboard."}
                </p>
                <Button asChild>
                  <Link href={accountType === "physician" ? "/login" : "/patient"}>
                    {accountType === "physician" ? "Go to Sign In →" : "Go to My Dashboard →"}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
