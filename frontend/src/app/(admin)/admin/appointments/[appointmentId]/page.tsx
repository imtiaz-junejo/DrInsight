import type { Metadata } from "next";
import { AppointmentDetailPageContent } from "@/components/admin/pages/AppointmentDetailPageContent";

export const metadata: Metadata = {
  title: "Appointment Details — DrInsight Admin",
  robots: { index: false, follow: false },
};

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = await params;
  return <AppointmentDetailPageContent appointmentId={appointmentId} />;
}
