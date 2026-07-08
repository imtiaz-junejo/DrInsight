import { api } from "@/lib/api";
import type { AuthUser } from "@/store/auth.store";

export type PatientAuthStatus = "patient" | "unauthenticated" | "non-patient";

export const BOOKING_RETURN_PATH = "/book-consultation";
export const BOOKING_AUTH_FROM = "booking";

export function bookingLoginUrl(): string {
  const params = new URLSearchParams({
    redirect: BOOKING_RETURN_PATH,
    from: BOOKING_AUTH_FROM,
  });
  return `/login?${params.toString()}`;
}

export function bookingRegisterUrl(): string {
  const params = new URLSearchParams({
    redirect: BOOKING_RETURN_PATH,
    from: BOOKING_AUTH_FROM,
    account: "patient",
  });
  return `/register?${params.toString()}`;
}

/** Verify the current session with the backend — do not trust client state alone. */
export async function verifyPatientSession(): Promise<{
  status: PatientAuthStatus;
  user: AuthUser | null;
}> {
  const accessToken =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  if (!accessToken) {
    return { status: "unauthenticated", user: null };
  }

  try {
    const { data } = await api.get<AuthUser>("/auth/me");
    if (data.role === "PATIENT") {
      return { status: "patient", user: data };
    }
    return { status: "non-patient", user: data };
  } catch {
    return { status: "unauthenticated", user: null };
  }
}

export function isBookingAuthFlow(searchParams: URLSearchParams | { get: (key: string) => string | null }): boolean {
  return searchParams.get("from") === BOOKING_AUTH_FROM;
}
