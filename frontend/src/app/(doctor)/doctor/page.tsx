import type { Metadata } from "next";
import { doctorPageMeta } from "@/config/doctor-nav";
import { DashboardPageContent } from "@/components/doctor/pages/DashboardPageContent";

export const metadata: Metadata = {
  title: `${doctorPageMeta.dashboard[0]} — DrInsight`,
  description: doctorPageMeta.dashboard[1],
};

export default function DoctorDashboardPage() {
  return <DashboardPageContent />;
}
