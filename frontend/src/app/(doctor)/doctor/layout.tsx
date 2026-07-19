import type { Metadata } from "next";
import { DashboardAuthGuard } from "@/components/auth/DashboardAuthGuard";
import { DoctorShell } from "@/components/doctor/shell/DoctorShell";
import { DashboardProviders } from "@/components/providers/DashboardProviders";
import "@/styles/doctor-dashboard.css";
import "@/styles/e-prescription.css";
import "@/styles/clinical-notes.css";

export const metadata: Metadata = {
  title: "Doctor Dashboard — DrInsight",
  robots: { index: false, follow: false },
};

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProviders>
      <DashboardAuthGuard>
        <DoctorShell>{children}</DoctorShell>
      </DashboardAuthGuard>
    </DashboardProviders>
  );
}
