import type { Metadata } from "next";
import { doctorPageMeta } from "@/config/doctor-nav";
import { SubmitArticlePageContent } from "@/components/doctor/pages/SubmitArticlePageContent";

const routeId = "submit-article" as const;

export const metadata: Metadata = {
  title: `${doctorPageMeta[routeId][0]} — DrInsight`,
  description: doctorPageMeta[routeId][1],
};

export default function DoctorSubmitArticlePage() {
  return <SubmitArticlePageContent />;
}
