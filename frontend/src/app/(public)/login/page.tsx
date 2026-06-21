import { AuthLeftPanel } from "@/components/auth/AuthLeftPanel";
import { LoginForm } from "@/components/auth/LoginForm";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

export const metadata = {
  title: "Login — DrInsight",
  description: "Sign in to your DrInsight patient or doctor account.",
};

export default function LoginPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Login" }]} />
      <div className="grid min-h-[calc(100vh-112px)] lg:grid-cols-2">
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
            { icon: "🔧", text: "Track your health tool results over time" },
            { icon: "📅", text: "Manage upcoming and past consultations" },
            { icon: "🔔", text: "Get alerts when followed articles are updated" },
          ]}
          pills={["🛡️ HIPAA Compliant", "🔒 256-bit SSL", "🇪🇺 GDPR Compliant"]}
        />
        <div className="flex items-center justify-center bg-gray-50 px-6 py-10">
          <LoginForm />
        </div>
      </div>
    </>
  );
}
