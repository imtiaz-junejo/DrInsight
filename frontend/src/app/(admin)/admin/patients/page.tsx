import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { PatientsPageContent } from "@/components/admin/pages/PatientsPageContent";

const routeId = "patients" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — MedAuthority Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <PatientsPageContent />;
}
