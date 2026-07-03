import type { Metadata } from "next";
import DisclaimerPageClient from "./DisclaimerPageClient";

export const metadata: Metadata = {
  title: "Disclaimer — MedAuthority",
  description:
    "Important information about the nature, limitations, and intended use of content published on MedAuthority.",
};

export default function DisclaimerPage() {
  return <DisclaimerPageClient />;
}
