import { VerifyEmailPageContent } from "@/components/auth/VerifyEmailPageContent";
import "@/styles/complete-profile-page.css";
import "@/styles/register-page.css";

export const metadata = {
  title: "Verify Email — DrInsight",
  description: "Confirm your DrInsight email address using your secure verification link.",
};

export default function VerifyEmailPage() {
  return <VerifyEmailPageContent />;
}
