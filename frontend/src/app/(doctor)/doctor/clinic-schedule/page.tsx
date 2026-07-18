import type { Metadata } from "next";
import { doctorPageMeta } from "@/config/doctor-nav";
import { ClinicSchedulePageContent } from "@/components/doctor/pages/ClinicSchedulePageContent";

const routeId = "clinic-schedule" as const;

export const metadata: Metadata = {
  title: `${doctorPageMeta[routeId][0]} — DrInsight`,
  description: doctorPageMeta[routeId][1],
};

export default function DoctorClinicSchedulePage() {
  return <ClinicSchedulePageContent />;
}
