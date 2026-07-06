import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import "@/styles/reset-password-page.css";

export const metadata = {
  title: "Reset Password — DrInsight",
  description: "Set a new password for your DrInsight account using your secure reset link.",
};

export default function ResetPasswordPage() {
  return (
    <div className="reset-password-page">
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
