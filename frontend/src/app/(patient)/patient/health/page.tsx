import type { Metadata } from "next";
import { patientPageMeta } from "@/config/patient-nav";
import { HealthPageContent } from "@/components/patient/pages/HealthPageContent";

const routeId = "health" as const;

export const metadata: Metadata = {
  title: `${patientPageMeta[routeId][0]} — MedAuthority`,
  description: patientPageMeta[routeId][1],
};

export default function PatientHealthPage() {
  return <HealthPageContent />;
}
