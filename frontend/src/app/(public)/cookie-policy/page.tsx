import type { Metadata } from "next";
import "@/styles/cookie-policy-page.css";
import { CookiePolicyPageClient } from "@/components/legal/CookiePolicyPageClient";

export const metadata: Metadata = {
  title: "Cookie Policy — MedAuthority",
  description:
    "Learn how MedAuthority uses cookies, what we track, and how you can manage your preferences.",
};

export default function CookiePolicyPage() {
  return <CookiePolicyPageClient />;
}
