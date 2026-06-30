import type { Metadata } from "next";
import { patientPageMeta } from "@/config/patient-nav";
import { DashboardPageContent } from "@/components/patient/pages/DashboardPageContent";

export const metadata: Metadata = {
  title: `${patientPageMeta.dashboard[0]} — MedAuthority`,
  description: patientPageMeta.dashboard[1],
};

export default function PatientDashboardPage() {
  return <DashboardPageContent />;
}
