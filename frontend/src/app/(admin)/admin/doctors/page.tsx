import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { DoctorsPageContent } from "@/components/admin/pages/DoctorsPageContent";

const routeId = "doctors" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — MedAuthority Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <DoctorsPageContent />;
}
