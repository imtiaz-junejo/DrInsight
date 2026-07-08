import type { Metadata } from "next";
import { doctorPageMeta } from "@/config/doctor-nav";
import { PublicationsPageContent } from "@/components/doctor/pages/PublicationsPageContent";

const routeId = "publications" as const;

export const metadata: Metadata = {
  title: `${doctorPageMeta[routeId][0]} — DrInsight`,
  description: doctorPageMeta[routeId][1],
};

export default function DoctorPublicationsPage() {
  return <PublicationsPageContent />;
}
