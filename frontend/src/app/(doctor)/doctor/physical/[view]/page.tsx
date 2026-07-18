import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { doctorPageMeta } from "@/config/doctor-nav";
import {
  PhysicalAppointmentsContent,
  type PhysicalView,
} from "@/components/doctor/pages/PhysicalAppointmentsContent";

const VIEWS: PhysicalView[] = ["requests", "upcoming", "today", "completed", "cancelled"];

export async function generateMetadata({ params }: { params: Promise<{ view: string }> }): Promise<Metadata> {
  const { view } = await params;
  const meta = doctorPageMeta[`phys-${view}`];
  if (!meta) return { title: "Physical Appointments — DrInsight" };
  return { title: `${meta[0]} — DrInsight`, description: meta[1] };
}

export default async function DoctorPhysicalAppointmentsPage({
  params,
}: {
  params: Promise<{ view: string }>;
}) {
  const { view } = await params;
  if (!VIEWS.includes(view as PhysicalView)) notFound();
  return <PhysicalAppointmentsContent view={view as PhysicalView} />;
}
