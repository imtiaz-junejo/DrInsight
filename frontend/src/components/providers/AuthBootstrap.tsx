"use client";

import { AuthHydrator } from "@/components/auth/AuthHydrator";

/** Validates persisted session tokens and hydrates auth state. */
export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  return <AuthHydrator>{children}</AuthHydrator>;
}
