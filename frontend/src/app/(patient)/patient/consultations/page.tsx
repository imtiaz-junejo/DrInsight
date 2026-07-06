import type { Metadata } from "next";
import { patientPageMeta } from "@/config/patient-nav";
import { ConsultationsPageContent } from "@/components/patient/pages/ConsultationsPageContent";

const routeId = "consultations" as const;

export const metadata: Metadata = {
  title: `${patientPageMeta[routeId][0]} — DrInsight`,
  description: patientPageMeta[routeId][1],
};

export default function PatientConsultationsPage() {
  return <ConsultationsPageContent />;
}
