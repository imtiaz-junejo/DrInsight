import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import "@/styles/forgot-password-page.css";

export const metadata = {
  title: "Forgot Password — DrInsight",
  description: "Reset your DrInsight account password via email or SMS.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="forgot-password-page">
      <ForgotPasswordForm />
    </div>
  );
}
