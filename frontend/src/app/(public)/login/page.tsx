import { Suspense } from "react";
import { AuthLeftPanel } from "@/components/auth/AuthLeftPanel";
import { AuthPageBodyFlag } from "@/components/auth/AuthPageBodyFlag";
import { LoginForm } from "@/components/auth/LoginForm";
import "@/styles/auth-pages.css";

export const metadata = {
  title: "Login — DrInsight",
  description: "Sign in to your DrInsight patient or doctor account.",
};

export default function LoginPage() {
  return (
    <>
      <AuthPageBodyFlag />
      <div className="auth-page-shell">
        <AuthLeftPanel
          eyebrow="PATIENT & DOCTOR PORTAL"
          title={
            <>
              Your Health Journey <span className="text-[#93c5fd]">Starts Here</span>
            </>
          }
          description="Access your personalised health dashboard, track consultations, and get expert answers — all in one secure platform."
          features={[
            { icon: "📋", text: "View your consultation history and doctor responses" },
            { icon: "🔖", text: "Access your saved articles and health guides" },
            { icon: "📅", text: "Manage upcoming and past consultations" },
          ]}
          pills={["🛡️ HIPAA Compliant", "🔒 256-bit SSL", "🇪🇺 GDPR Compliant"]}
        />
        <div className="auth-page-panel">
          <Suspense fallback={<div className="text-[.9rem] text-gray-500">Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </>
  );
}
