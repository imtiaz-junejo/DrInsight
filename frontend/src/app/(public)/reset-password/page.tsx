"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLeftPanel } from "@/components/auth/AuthLeftPanel";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const [done, setDone] = useState(false);

  return (
    <>
      <Breadcrumb items={[{ label: "Login", href: "/login" }, { label: "Reset Password" }]} />
      <div className="grid min-h-[calc(100vh-112px)] lg:grid-cols-2">
        <AuthLeftPanel
          eyebrow="SECURE PASSWORD RESET"
          title={
            <>
              Create a New <span className="text-[#93c5fd]">Strong Password</span>
            </>
          }
          description="Choose a unique password with at least 8 characters, including uppercase, numbers, and symbols for maximum security."
          pills={["🔒 256-bit encryption", "🛡️ Account protected"]}
        />
        <div className="flex items-center justify-center bg-gray-50 px-6 py-10">
          <div className="w-full max-w-[440px] rounded-[20px] border border-gray-200 bg-white p-10 shadow-[var(--shadow-lg)]">
            <div className="mb-6 flex justify-center">
              <Logo />
            </div>
            {!done ? (
              <>
                <h2 className="font-display text-center text-[1.55rem] font-bold text-gray-900">Set New Password</h2>
                <p className="mb-6 text-center text-[.84rem] text-gray-500">Enter and confirm your new password below</p>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setDone(true);
                  }}
                >
                  <div>
                    <label className="mb-1.5 block text-[.84rem] font-semibold text-gray-700">New Password</label>
                    <Input type="password" required minLength={8} placeholder="Create a strong password" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[.84rem] font-semibold text-gray-700">Confirm Password</label>
                    <Input type="password" required minLength={8} placeholder="Repeat your password" />
                  </div>
                  <Button type="submit" size="full">
                    Update Password →
                  </Button>
                </form>
              </>
            ) : (
              <div className="py-4 text-center">
                <div className="mb-4 text-5xl">✅</div>
                <h3 className="font-display mb-3 text-[1.4rem] font-bold">Password Updated!</h3>
                <p className="mb-6 text-[.88rem] text-gray-500">Your password has been reset successfully.</p>
                <Button asChild size="full">
                  <Link href="/login">Sign In to Your Account →</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
