import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { WomensHealthRemindersPageContent } from "@/components/admin/pages/WomensHealthRemindersPageContent";

const routeId = "whr" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — DrInsight Admin`,
  description: adminPageMeta[routeId][1],
};

export default function WomensHealthRemindersPage() {
  return <WomensHealthRemindersPageContent />;
}
