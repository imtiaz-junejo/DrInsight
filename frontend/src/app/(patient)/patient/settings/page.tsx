import type { Metadata } from "next";
import { patientPageMeta } from "@/config/patient-nav";
import { SettingsPageContent } from "@/components/patient/pages/SettingsPageContent";

const routeId = "settings" as const;

export const metadata: Metadata = {
  title: `${patientPageMeta[routeId][0]} — DrInsight`,
  description: patientPageMeta[routeId][1],
};

export default function PatientSettingsPage() {
  return <SettingsPageContent />;
}
