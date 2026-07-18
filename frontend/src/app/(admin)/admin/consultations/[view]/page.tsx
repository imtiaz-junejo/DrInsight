import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminPageMeta } from "@/config/admin-nav";
import {
  AdminConsultationsPageContent,
  type AdminOnlineView,
} from "@/components/admin/pages/AdminConsultationsPageContent";

const VIEWS: AdminOnlineView[] = ["pending", "approved", "upcoming", "ongoing", "completed", "cancelled", "reports"];

export async function generateMetadata({ params }: { params: Promise<{ view: string }> }): Promise<Metadata> {
  const { view } = await params;
  const meta = adminPageMeta[`oc-${view}`];
  if (!meta) return { title: "Consultations — DrInsight Admin" };
  return { title: `${meta[0]} — DrInsight Admin`, description: meta[1] };
}

export default async function AdminConsultationsViewPage({ params }: { params: Promise<{ view: string }> }) {
  const { view } = await params;
  if (!VIEWS.includes(view as AdminOnlineView)) notFound();
  return <AdminConsultationsPageContent view={view as AdminOnlineView} />;
}
