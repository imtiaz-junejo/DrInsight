import type { Metadata } from "next";
import { doctorPageMeta } from "@/config/doctor-nav";
import { AppointmentsPageContent } from "@/components/doctor/pages/AppointmentsPageContent";

const routeId = "appointments" as const;

export const metadata: Metadata = {
  title: `${doctorPageMeta[routeId][0]} — MedAuthority`,
  description: doctorPageMeta[routeId][1],
};

export default function DoctorAppointmentsPage() {
  return <AppointmentsPageContent />;
}
