import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { patientPageMeta } from "@/config/patient-nav";
import {
  OnlineConsultationsPatientContent,
  type PatientOnlineView,
} from "@/components/patient/pages/OnlineConsultationsPatientContent";

const VIEWS: PatientOnlineView[] = ["pending", "upcoming", "ongoing", "completed", "cancelled", "history"];

export async function generateMetadata({ params }: { params: Promise<{ view: string }> }): Promise<Metadata> {
  const { view } = await params;
  const meta = patientPageMeta[`oc-${view}`];
  if (!meta) return { title: "My Consultations — DrInsight" };
  return { title: `${meta[0]} — DrInsight`, description: meta[1] };
}

export default async function PatientConsultationsViewPage({ params }: { params: Promise<{ view: string }> }) {
  const { view } = await params;
  if (!VIEWS.includes(view as PatientOnlineView)) notFound();
  return <OnlineConsultationsPatientContent view={view as PatientOnlineView} />;
}
