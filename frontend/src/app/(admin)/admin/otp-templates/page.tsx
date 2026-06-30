import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { OtpTemplatesPageContent } from "@/components/admin/pages/OtpTemplatesPageContent";

const routeId = "otp-templates" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — MedAuthority Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <OtpTemplatesPageContent />;
}
