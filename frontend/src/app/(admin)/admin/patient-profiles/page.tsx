import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { PatientProfilesPageContent } from "@/components/admin/pages/PatientProfilesPageContent";

const routeId = "patient-profiles" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — DrInsight Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPatientProfilesPage() {
  return <PatientProfilesPageContent />;
}
