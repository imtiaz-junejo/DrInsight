import type { Metadata } from "next";
import { patientPageMeta } from "@/config/patient-nav";
import { QuestionsPageContent } from "@/components/patient/pages/QuestionsPageContent";

const routeId = "questions" as const;

export const metadata: Metadata = {
  title: `${patientPageMeta[routeId][0]} — DrInsight`,
  description: patientPageMeta[routeId][1],
};

export default function PatientQuestionsPage() {
  return <QuestionsPageContent />;
}
