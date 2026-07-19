import { AuthBootstrap } from "@/components/providers/AuthBootstrap";

export default function StandaloneLayout({ children }: { children: React.ReactNode }) {
  return <AuthBootstrap>{children}</AuthBootstrap>;
}
