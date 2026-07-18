import type { Metadata } from "next";
import { doctorPageMeta } from "@/config/doctor-nav";
import { DoctorQAContent } from "@/components/doctor/pages/DoctorQAContent";

const routeId = "qa-new" as const;

export const metadata: Metadata = {
  title: `${doctorPageMeta[routeId][0]} — DrInsight`,
  description: doctorPageMeta[routeId][1],
};

export default function DoctorQuestionsPage() {
  return <DoctorQAContent view="new" />;
}
