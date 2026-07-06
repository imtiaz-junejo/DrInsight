import type { Metadata } from "next";
import DisclaimerPageClient from "./DisclaimerPageClient";

export const metadata: Metadata = {
  title: "Disclaimer — DrInsight",
  description:
    "Important information about the nature, limitations, and intended use of content published on DrInsight.",
};

export default function DisclaimerPage() {
  return <DisclaimerPageClient />;
}
