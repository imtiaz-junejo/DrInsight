import type { Metadata } from "next";
import { doctorPageMeta } from "@/config/doctor-nav";
import { PatientsPageContent } from "@/components/doctor/pages/PatientsPageContent";

const routeId = "patients" as const;

export const metadata: Metadata = {
  title: `${doctorPageMeta[routeId][0]} — DrInsight`,
  description: doctorPageMeta[routeId][1],
};

export default function DoctorPatientsPage() {
  return <PatientsPageContent />;
}
