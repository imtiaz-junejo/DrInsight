import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { ContactInquiriesPageContent } from "@/components/admin/pages/ContactInquiriesPageContent";

const routeId = "contact-inquiries" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — MedAuthority Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <ContactInquiriesPageContent />;
}
