import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { UsersPageContent } from "@/components/admin/pages/UsersPageContent";

const routeId = "users" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — MedAuthority Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <UsersPageContent />;
}
