import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { AdvertisementsPageContent } from "@/components/admin/pages/AdvertisementsPageContent";

const routeId = "advertisements" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — DrInsight Admin`,
  description: adminPageMeta[routeId][1],
};

export default function AdminPage() {
  return <AdvertisementsPageContent />;
}
