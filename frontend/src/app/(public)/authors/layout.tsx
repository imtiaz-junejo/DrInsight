import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Medical Author Profile — Credentials & Articles | DrInsight",
  description:
    "View this DrInsight medical author's credentials, specialty, verification status and published, physician-reviewed articles.",
  robots: { index: true, follow: true },
  openGraph: {
    siteName: "The Dr Insight",
    type: "profile",
    title: "Medical Author Profile — Credentials & Articles | DrInsight",
    description:
      "View this DrInsight medical author's credentials, specialty, verification status and published, physician-reviewed articles.",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Medical Author Profile — Credentials & Articles | DrInsight",
    description:
      "View this DrInsight medical author's credentials, specialty, verification status and published, physician-reviewed articles.",
  },
};

export default function AuthorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
