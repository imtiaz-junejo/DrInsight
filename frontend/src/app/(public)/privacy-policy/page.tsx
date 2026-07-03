import type { Metadata } from "next";
import PrivacyPolicyPageClient from "@/components/legal/PrivacyPolicyPageClient";

export const metadata: Metadata = {
  title: "Privacy Policy — MedAuthority",
  description:
    "Learn how MedAuthority collects, uses, and protects your personal information. HIPAA and GDPR compliant privacy policy.",
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyPageClient />;
}
