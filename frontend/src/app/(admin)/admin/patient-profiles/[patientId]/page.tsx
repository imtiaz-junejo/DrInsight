import type { Metadata } from "next";
import { Suspense } from "react";
import { adminPageMeta } from "@/config/admin-nav";
import { AdminPatientProfileDetailPageContent } from "@/components/admin/pages/AdminPatientProfileDetailPageContent";

const routeId = "patient-profiles" as const;

export const metadata: Metadata = {
  title: `${adminPageMeta[routeId][0]} — DrInsight Admin`,
  description: adminPageMeta[routeId][1],
};

export default async function AdminPatientProfileDetailPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Loading profile...</div>}>
      <AdminPatientProfileDetailPageContent patientId={patientId} />
    </Suspense>
  );
}
