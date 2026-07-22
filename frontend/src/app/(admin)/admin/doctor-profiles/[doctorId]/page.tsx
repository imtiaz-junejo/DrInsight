import type { Metadata } from "next";
import { adminPageMeta } from "@/config/admin-nav";
import { AdminDoctorProfileDetailPageContent } from "@/components/admin/pages/AdminDoctorProfileDetailPageContent";

const routeId = "doctor-seo" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — DrInsight Admin`,
  description: adminPageMeta[routeId][1],
};

export default async function AdminDoctorProfileDetailPage({
  params,
}: {
  params: Promise<{ doctorId: string }>;
}) {
  const { doctorId } = await params;
  return <AdminDoctorProfileDetailPageContent doctorId={doctorId} />;
}
