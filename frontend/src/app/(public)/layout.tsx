import { SiteLayout } from "@/components/layout/SiteLayout";
import { AuthBootstrap } from "@/components/providers/AuthBootstrap";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthBootstrap>
      <SiteLayout>{children}</SiteLayout>
    </AuthBootstrap>
  );
}
