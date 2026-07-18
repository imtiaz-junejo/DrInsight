import { CompleteProfilePageContent } from "@/components/auth/CompleteProfilePageContent";
import "@/styles/complete-profile-page.css";
import "@/styles/register-page.css";

export const metadata = {
  title: "Complete Your Profile — DrInsight",
  description: "Finish setting up your DrInsight account after social sign-in.",
};

export default function CompleteProfilePage() {
  return <CompleteProfilePageContent />;
}
