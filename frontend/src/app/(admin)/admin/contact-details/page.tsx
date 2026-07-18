import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { ContactDetailsPageContent } from "@/components/admin/pages/ContactDetailsPageContent";

const routeId = "contact-details" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — DrInsight Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <ContactDetailsPageContent />;
}
