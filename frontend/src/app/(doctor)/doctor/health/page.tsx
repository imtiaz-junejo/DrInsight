import type { Metadata } from "next";
import { doctorPageMeta } from "@/config/doctor-nav";
import { DoctorHealthPageContent } from "@/components/doctor/pages/HealthPageContent";

const routeId = "health" as const;

export const metadata: Metadata = {
  title: `${doctorPageMeta[routeId][0]} — DrInsight`,
  description: doctorPageMeta[routeId][1],
};

export default function DoctorHealthPage() {
  return <DoctorHealthPageContent />;
}
