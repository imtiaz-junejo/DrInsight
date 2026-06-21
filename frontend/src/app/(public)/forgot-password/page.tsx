import Link from "next/link";
import { AuthLeftPanel } from "@/components/auth/AuthLeftPanel";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata = {
  title: "Forgot Password — DrInsight",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Login", href: "/login" }, { label: "Forgot Password" }]} />
      <div className="grid min-h-[calc(100vh-112px)] lg:grid-cols-2">
        <AuthLeftPanel
          eyebrow="ACCOUNT RECOVERY"
          title={
            <>
              We&apos;ll Help You <span className="text-[#93c5fd]">Get Back In</span>
            </>
          }
          description="Enter the email associated with your DrInsight account and we'll send you a secure password reset link."
          pills={["🔒 Secure reset link", "⏱ Expires in 1 hour", "🛡️ HIPAA compliant"]}
        />
        <div className="flex items-center justify-center bg-gray-50 px-6 py-10">
          <div className="w-full max-w-[440px] rounded-[20px] border border-gray-200 bg-white p-10 shadow-[var(--shadow-lg)]">
            <div className="mb-6 flex justify-center">
              <Logo />
            </div>
            <h2 className="font-display text-center text-[1.55rem] font-bold text-gray-900">Reset Your Password</h2>
            <p className="mb-6 text-center text-[.84rem] text-gray-500">
              Enter your email and we&apos;ll send reset instructions
            </p>
            <form className="space-y-4" action="/reset-password">
              <div>
                <label className="mb-1.5 block text-[.84rem] font-semibold text-gray-700">Email Address</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">✉️</span>
                  <Input name="email" type="email" required placeholder="you@example.com" className="pl-10" />
                </div>
              </div>
              <Button type="submit" size="full">
                Send Reset Link →
              </Button>
            </form>
            <p className="mt-4 text-center text-[.83rem] text-gray-500">
              Remember your password?{" "}
              <Link href="/login" className="font-bold text-blue">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
