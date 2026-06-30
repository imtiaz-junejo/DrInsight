import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { AuthorsPageContent } from "@/components/admin/pages/AuthorsPageContent";

const routeId = "authors" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — MedAuthority Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <AuthorsPageContent />;
}
