import type { Metadata } from "next";
import { doctorPageMeta } from "@/config/doctor-nav";
import { PrescriptionsPageContent } from "@/components/doctor/pages/PrescriptionsPageContent";

const routeId = "prescriptions" as const;

export const metadata: Metadata = {
  title: `${doctorPageMeta[routeId][0]} — DrInsight`,
  description: doctorPageMeta[routeId][1],
};

export default function DoctorPrescriptionsPage() {
  return <PrescriptionsPageContent />;
}
