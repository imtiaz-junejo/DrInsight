import type { Metadata } from "next";
import { Suspense } from "react";
import { doctorPageMeta } from "@/config/doctor-nav";
import { SubmitPublicationPageContent } from "@/components/doctor/pages/SubmitPublicationPageContent";

const routeId = "submit-publication" as const;

export const metadata: Metadata = {
  title: `${doctorPageMeta[routeId][0]} — DrInsight`,
  description: doctorPageMeta[routeId][1],
};

export default function DoctorSubmitPublicationPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: "var(--gray-400)" }}>Loading...</div>}>
      <SubmitPublicationPageContent />
    </Suspense>
  );
}
