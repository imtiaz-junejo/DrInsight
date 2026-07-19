"use client";

import { QueryProvider } from "@/components/providers/QueryProvider";

/** @deprecated Use QueryProvider at root and scoped DashboardProviders/AuthBootstrap instead. */
export function Providers({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}

export { QueryProvider } from "@/components/providers/QueryProvider";
export { AuthBootstrap } from "@/components/providers/AuthBootstrap";
export { DashboardProviders } from "@/components/providers/DashboardProviders";
