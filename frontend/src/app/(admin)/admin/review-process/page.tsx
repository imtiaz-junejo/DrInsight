import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { ReviewProcessPageContent } from "@/components/admin/pages/ReviewProcessPageContent";

const routeId = "review-process" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — MedAuthority Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <ReviewProcessPageContent />;
}
