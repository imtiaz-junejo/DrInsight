import type { Metadata } from "next";
import { doctorPageMeta } from "@/config/doctor-nav";
import { ArticlesPageContent } from "@/components/doctor/pages/ArticlesPageContent";

const routeId = "articles" as const;

export const metadata: Metadata = {
  title: `${doctorPageMeta[routeId][0]} — MedAuthority`,
  description: doctorPageMeta[routeId][1],
};

export default function DoctorArticlesPage() {
  return <ArticlesPageContent />;
}
