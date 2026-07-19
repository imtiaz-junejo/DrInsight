"use client";

import dynamic from "next/dynamic";
import { DashboardAuthGuard } from "@/components/auth/DashboardAuthGuard";

const ConsultationRoom = dynamic(
  () => import("@/components/consultation/ConsultationRoom").then((m) => m.ConsultationRoom),
  { ssr: false },
);

export function PatientConsultationPageContent({ appointmentId }: { appointmentId: string }) {
  return (
    <DashboardAuthGuard>
      <ConsultationRoom appointmentId={appointmentId} role="patient" />
    </DashboardAuthGuard>
  );
}
