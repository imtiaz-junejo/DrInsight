import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { DoctorProfilesPageContent } from "@/components/admin/pages/DoctorProfilesPageContent";

const routeId = "doctor-seo" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — DrInsight Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminDoctorProfilesPage() {
  return <DoctorProfilesPageContent />;
}
