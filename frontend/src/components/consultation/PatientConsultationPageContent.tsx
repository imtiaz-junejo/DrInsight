"use client";

import { DashboardAuthGuard } from "@/components/auth/DashboardAuthGuard";
import { ConsultationRoom } from "@/components/consultation/ConsultationRoom";

export function PatientConsultationPageContent({ appointmentId }: { appointmentId: string }) {
  return (
    <DashboardAuthGuard>
      <ConsultationRoom appointmentId={appointmentId} role="patient" />
    </DashboardAuthGuard>
  );
}
