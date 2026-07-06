import { RegisterForm } from "@/components/auth/RegisterForm";
import "@/styles/register-page.css";

export const metadata = {
  title: "Create Account — DrInsight",
  description: "Create your free DrInsight patient or physician account.",
};

export default function RegisterPage() {
  return (
    <div className="register-page">
      <RegisterForm />
    </div>
  );
}
