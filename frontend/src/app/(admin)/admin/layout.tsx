import type { Metadata } from "next";
import { DashboardAuthGuard } from "@/components/auth/DashboardAuthGuard";
import { AdminShell } from "@/components/admin/shell/AdminShell";
import "@/styles/admin-panel.css";
import "@/styles/dashboard-shared-icons.css";

export const metadata: Metadata = {
  title: "Admin Panel — DrInsight",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardAuthGuard>
      <AdminShell>{children}</AdminShell>
    </DashboardAuthGuard>
  );
}
