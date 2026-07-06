import type { Metadata } from "next";
import "@/styles/terms-conditions-page.css";
import { TermsConditionsPageClient } from "@/components/legal/TermsConditionsPageClient";

export const metadata: Metadata = {
  title: "Terms & Conditions — DrInsight",
  description:
    "Terms and conditions for using DrInsight. Please read carefully before using our platform.",
};

export default function TermsConditionsPage() {
  return <TermsConditionsPageClient />;
}
