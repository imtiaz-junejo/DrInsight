import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { EmailTemplatesPageContent } from "@/components/admin/pages/EmailTemplatesPageContent";

const routeId = "email-templates" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — MedAuthority Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <EmailTemplatesPageContent />;
}
