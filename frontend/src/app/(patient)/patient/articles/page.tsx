import type { Metadata } from "next";
import { patientPageMeta } from "@/config/patient-nav";
import { ArticlesPageContent } from "@/components/patient/pages/ArticlesPageContent";

const routeId = "articles" as const;

export const metadata: Metadata = {
  title: `${patientPageMeta[routeId][0]} — MedAuthority`,
  description: patientPageMeta[routeId][1],
};

export default function PatientArticlesPage() {
  return <ArticlesPageContent />;
}
