import type { Metadata } from "next";
import { DashboardAuthGuard } from "@/components/auth/DashboardAuthGuard";
import { PatientShell } from "@/components/patient/shell/PatientShell";
import "@/styles/patient-dashboard.css";
import "@/styles/clinical-notes.css";

export const metadata: Metadata = {
  title: "Patient Dashboard — DrInsight",
  robots: { index: false, follow: false },
};

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardAuthGuard>
      <PatientShell>{children}</PatientShell>
    </DashboardAuthGuard>
  );
}
