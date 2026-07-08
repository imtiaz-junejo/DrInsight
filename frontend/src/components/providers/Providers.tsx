"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthHydrator } from "@/components/auth/AuthHydrator";
import { ResponsiveTableLabels } from "@/components/layout/ResponsiveTableLabels";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 1 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthHydrator>
        <ResponsiveTableLabels />
        {children}
      </AuthHydrator>
    </QueryClientProvider>
  );
}
