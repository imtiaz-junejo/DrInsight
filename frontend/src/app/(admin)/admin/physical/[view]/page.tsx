import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminPageMeta } from "@/config/admin-nav";
import {
  AdminPhysicalPageContent,
  type AdminPhysicalView,
} from "@/components/admin/pages/AdminPhysicalPageContent";

const VIEWS: AdminPhysicalView[] = ["pending", "approved", "rejected", "upcoming", "completed", "cancelled"];

export async function generateMetadata({ params }: { params: Promise<{ view: string }> }): Promise<Metadata> {
  const { view } = await params;
  const meta = adminPageMeta[`phys-${view}`];
  if (!meta) return { title: "Physical Appointments — DrInsight Admin" };
  return { title: `${meta[0]} — DrInsight Admin`, description: meta[1] };
}

export default async function AdminPhysicalViewPage({ params }: { params: Promise<{ view: string }> }) {
  const { view } = await params;
  if (!VIEWS.includes(view as AdminPhysicalView)) notFound();
  return <AdminPhysicalPageContent view={view as AdminPhysicalView} />;
}
