import type { Metadata } from "next";
import { patientPageMeta } from "@/config/patient-nav";
import { ProfilePageContent } from "@/components/patient/pages/ProfilePageContent";

const routeId = "profile" as const;

export const metadata: Metadata = {
  title: `${patientPageMeta[routeId][0]} — DrInsight`,
  description: patientPageMeta[routeId][1],
};

export default function PatientProfilePage() {
  return <ProfilePageContent />;
}
