import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { patientPageMeta } from "@/config/patient-nav";
import {
  QuestionsPatientContent,
  type PatientQuestionView,
} from "@/components/patient/pages/QuestionsPatientContent";

const VIEWS: PatientQuestionView[] = ["ask", "pending", "answered", "rejected"];

export async function generateMetadata({ params }: { params: Promise<{ view: string }> }): Promise<Metadata> {
  const { view } = await params;
  const meta = patientPageMeta[`qa-${view}`];
  if (!meta) return { title: "My Questions — DrInsight" };
  return { title: `${meta[0]} — DrInsight`, description: meta[1] };
}

export default async function PatientQuestionsViewPage({ params }: { params: Promise<{ view: string }> }) {
  const { view } = await params;
  if (!VIEWS.includes(view as PatientQuestionView)) notFound();
  return <QuestionsPatientContent view={view as PatientQuestionView} />;
}
