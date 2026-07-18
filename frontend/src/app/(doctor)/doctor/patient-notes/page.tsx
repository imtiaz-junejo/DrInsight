import type { Metadata } from "next";
import { Suspense } from "react";
import { doctorPageMeta } from "@/config/doctor-nav";
import { PatientNotesPageContent } from "@/components/doctor/pages/PatientNotesPageContent";

const routeId = "patient-notes" as const;

export const metadata: Metadata = {
  title: `${doctorPageMeta[routeId][0]} — DrInsight`,
  description: doctorPageMeta[routeId][1],
};

export default function DoctorPatientNotesPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading patient notes...</div>}>
      <PatientNotesPageContent />
    </Suspense>
  );
}
