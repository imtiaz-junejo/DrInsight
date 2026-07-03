import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { RegisterForm } from "@/components/auth/RegisterForm";
import "@/styles/register-page.css";

export const metadata = {
  title: "Create Account — MedAuthority",
  description: "Create your free MedAuthority patient or physician account.",
};

export default function RegisterPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Login", href: "/login" }, { label: "Create Account" }]} />
      <div className="register-page">
        <RegisterForm />
      </div>
    </>
  );
}
