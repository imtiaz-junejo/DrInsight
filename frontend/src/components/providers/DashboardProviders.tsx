"use client";

import { ResponsiveTableLabels } from "@/components/layout/ResponsiveTableLabels";
import { AuthBootstrap } from "@/components/providers/AuthBootstrap";

/** Dashboard-only providers (auth bootstrap + responsive table labels). */
export function DashboardProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthBootstrap>
      <ResponsiveTableLabels />
      {children}
    </AuthBootstrap>
  );
}
