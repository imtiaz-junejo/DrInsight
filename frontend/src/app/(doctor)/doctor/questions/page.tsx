import type { Metadata } from "next";
import { doctorPageMeta } from "@/config/doctor-nav";
import { QuestionsPageContent } from "@/components/doctor/pages/QuestionsPageContent";

const routeId = "questions" as const;

export const metadata: Metadata = {
  title: `${doctorPageMeta[routeId][0]} — MedAuthority`,
  description: doctorPageMeta[routeId][1],
};

export default function DoctorQuestionsPage() {
  return <QuestionsPageContent />;
}
