import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import "@/styles/forgot-password-page.css";

export const metadata = {
  title: "Forgot Password — MedAuthority",
  description: "Reset your MedAuthority account password via email or SMS.",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Login", href: "/login" }, { label: "Forgot Password" }]} />
      <div className="forgot-password-page">
        <ForgotPasswordForm />
      </div>
    </>
  );
}
