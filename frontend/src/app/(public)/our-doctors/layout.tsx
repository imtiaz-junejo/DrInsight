import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Medical Team — Doctors Directory | DrInsight",
  description:
    "Meet DrInsight's network of board-certified physicians across multiple specialties. Search and filter by specialty, country, and rating to find the right doctor.",
};

export default function DoctorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
