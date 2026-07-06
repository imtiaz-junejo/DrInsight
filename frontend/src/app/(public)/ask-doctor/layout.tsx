import type { Metadata } from "next";
import "@/styles/ask-doctor-page.css";

export const metadata: Metadata = {
  title: "Ask the Doctor — Free Medical Q&A | DrInsight",
  description:
    "Submit your health question and receive a personalised, medically reviewed answer from one of our specialist physicians.",
};

export default function AskDoctorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
