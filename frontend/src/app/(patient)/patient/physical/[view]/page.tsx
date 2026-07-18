import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { patientPageMeta } from "@/config/patient-nav";
import {
  PhysicalAppointmentsPatientContent,
  type PatientPhysicalView,
} from "@/components/patient/pages/PhysicalAppointmentsPatientContent";

const VIEWS: PatientPhysicalView[] = ["upcoming", "pending", "confirmed", "completed", "cancelled"];

export async function generateMetadata({ params }: { params: Promise<{ view: string }> }): Promise<Metadata> {
  const { view } = await params;
  const meta = patientPageMeta[`phys-${view}`];
  if (!meta) return { title: "Physical Appointments — DrInsight" };
  return { title: `${meta[0]} — DrInsight`, description: meta[1] };
}

export default async function PatientPhysicalViewPage({ params }: { params: Promise<{ view: string }> }) {
  const { view } = await params;
  if (!VIEWS.includes(view as PatientPhysicalView)) notFound();
  return <PhysicalAppointmentsPatientContent view={view as PatientPhysicalView} />;
}
