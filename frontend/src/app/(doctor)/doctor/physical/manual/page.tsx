import type { Metadata } from "next";
import { doctorPageMeta } from "@/config/doctor-nav";
import { ManualAppointmentsContent } from "@/components/doctor/pages/ManualAppointmentsContent";

const routeId = "phys-manual" as const;

export const metadata: Metadata = {
  title: `${doctorPageMeta[routeId][0]} — DrInsight`,
  description: doctorPageMeta[routeId][1],
};

export default function DoctorManualAppointmentsPage() {
  return <ManualAppointmentsContent />;
}
