import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import "@/styles/reset-password-page.css";

export const metadata = {
  title: "Reset Password — MedAuthority",
  description: "Set a new password for your MedAuthority account using your secure reset link.",
};

export default function ResetPasswordPage() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Login", href: "/login" },
          { label: "Forgot Password", href: "/forgot-password" },
          { label: "Reset Password" },
        ]}
      />
      <div className="reset-password-page">
        <ResetPasswordForm />
      </div>
    </>
  );
}
