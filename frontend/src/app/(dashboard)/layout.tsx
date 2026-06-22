import { SiteLayout } from "@/components/layout/SiteLayout";
import { DashboardAuthGuard } from "@/components/auth/DashboardAuthGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteLayout>
      <DashboardAuthGuard>{children}</DashboardAuthGuard>
    </SiteLayout>
  );
}
