import { Suspense } from "react";

export const metadata = {
  title: "Book a Doctor Consultation — MedAuthority",
  description:
    "Choose your specialty, select a doctor, pick a time, and get expert medical care — video, phone, or chat. Same-day appointments available.",
};

export default function BookConsultationLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="px-6 py-20 text-center text-gray-500">Loading...</div>}>{children}</Suspense>;
}
