import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Medical Team — Doctors Directory | MedAuthority",
  description:
    "Meet MedAuthority's network of 200+ board-certified physicians across 12 specialties. Search and filter by specialty, country, and rating to find the right doctor.",
};

export default function DoctorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
