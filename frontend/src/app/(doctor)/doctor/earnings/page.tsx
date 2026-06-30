import type { Metadata } from "next";
import { doctorPageMeta } from "@/config/doctor-nav";
import { EarningsPageContent } from "@/components/doctor/pages/EarningsPageContent";

const routeId = "earnings" as const;

export const metadata: Metadata = {
  title: `${doctorPageMeta[routeId][0]} — MedAuthority`,
  description: doctorPageMeta[routeId][1],
};

export default function DoctorEarningsPage() {
  return <EarningsPageContent />;
}
