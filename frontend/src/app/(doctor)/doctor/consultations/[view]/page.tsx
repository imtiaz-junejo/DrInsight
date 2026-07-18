import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { doctorPageMeta } from "@/config/doctor-nav";
import {
  OnlineConsultationsContent,
  type OnlineView,
} from "@/components/doctor/pages/OnlineConsultationsContent";

const VIEWS: OnlineView[] = ["requests", "upcoming", "today", "ongoing", "completed", "cancelled", "history"];

export async function generateMetadata({ params }: { params: Promise<{ view: string }> }): Promise<Metadata> {
  const { view } = await params;
  const meta = doctorPageMeta[`oc-${view}`];
  if (!meta) return { title: "Online Consultations — DrInsight" };
  return { title: `${meta[0]} — DrInsight`, description: meta[1] };
}

export default async function DoctorOnlineConsultationsPage({
  params,
}: {
  params: Promise<{ view: string }>;
}) {
  const { view } = await params;
  if (!VIEWS.includes(view as OnlineView)) notFound();
  return <OnlineConsultationsContent view={view as OnlineView} />;
}
