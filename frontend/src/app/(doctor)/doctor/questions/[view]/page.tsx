import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { doctorPageMeta } from "@/config/doctor-nav";
import { DoctorQAContent } from "@/components/doctor/pages/DoctorQAContent";
import type { DoctorQuestionView } from "@/services/doctor-api-hooks";

const VIEWS: DoctorQuestionView[] = ["drafts", "answered", "rejected"];

export async function generateMetadata({ params }: { params: Promise<{ view: string }> }): Promise<Metadata> {
  const { view } = await params;
  const meta = doctorPageMeta[`qa-${view}`];
  if (!meta) return { title: "Patient Q&A — DrInsight" };
  return { title: `${meta[0]} — DrInsight`, description: meta[1] };
}

export default async function DoctorQuestionsViewPage({
  params,
}: {
  params: Promise<{ view: string }>;
}) {
  const { view } = await params;
  if (!VIEWS.includes(view as DoctorQuestionView)) notFound();
  return <DoctorQAContent view={view as DoctorQuestionView} />;
}
