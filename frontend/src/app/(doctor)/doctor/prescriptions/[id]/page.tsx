import type { Metadata } from "next";
import { PrescriptionDetailPageContent } from "@/components/doctor/pages/PrescriptionDetailPageContent";

export const metadata: Metadata = {
  title: "Prescription — DrInsight",
  description: "View e-prescription details",
};

export default async function DoctorPrescriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PrescriptionDetailPageContent prescriptionId={id} />;
}
