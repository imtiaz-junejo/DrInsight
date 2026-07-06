import type { Metadata } from "next";
import PrivacyPolicyPageClient from "@/components/legal/PrivacyPolicyPageClient";

export const metadata: Metadata = {
  title: "Privacy Policy — DrInsight",
  description:
    "Learn how DrInsight collects, uses, and protects your personal information. HIPAA and GDPR compliant privacy policy.",
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyPageClient />;
}
