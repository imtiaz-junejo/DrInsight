import type { Metadata } from "next";
import { doctorPageMeta } from "@/config/doctor-nav";
import { SettingsPageContent } from "@/components/doctor/pages/SettingsPageContent";

const routeId = "settings" as const;

export const metadata: Metadata = {
  title: `${doctorPageMeta[routeId][0]} — DrInsight`,
  description: doctorPageMeta[routeId][1],
};

export default function DoctorSettingsPage() {
  return <SettingsPageContent />;
}
