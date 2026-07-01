import { NextRequest, NextResponse } from "next/server";

const roleRoutes = [
  { prefix: "/patient", role: "PATIENT" },
  { prefix: "/doctor", role: "DOCTOR" },
  { prefix: "/admin", role: "ADMIN" },
] as const;

const guestOnlyRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

type JwtPayload = {
  sub: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  exp?: number;
};

function dashboardForRole(role: string) {
  if (role === "PATIENT") return "/patient";
  if (role === "DOCTOR") return "/doctor";
  if (role === "ADMIN") return "/admin";
  return "/";
}

function base64UrlToBytes(input: string) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function resolveJwtSecret(): string | undefined {
  return (
    process.env.JWT_ACCESS_SECRET ||
    process.env.NEXT_SERVER_JWT_ACCESS_SECRET ||
    (process.env.NODE_ENV === "development"
      ? "change-me-access-secret-min-32-chars-long"
      : undefined)
  );
}

async function verifyJwt(token?: string): Promise<JwtPayload | null> {
  if (!token) return null;

  const secret = resolveJwtSecret();
  if (!secret) return null;

  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return null;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlToBytes(signature),
    new TextEncoder().encode(`${header}.${payload}`),
  );
  if (!valid) return null;

  const parsed = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as JwtPayload;
  if (!parsed.sub || !parsed.role) return null;
  if (parsed.exp && parsed.exp * 1000 <= Date.now()) return null;

  return parsed;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("drinsight_access")?.value;
  const session = await verifyJwt(token);
  const role = session?.role;

  const protectedRoute = roleRoutes.find((route) => pathname.startsWith(route.prefix));

  if (protectedRoute) {
    if (!session || !role) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (role !== protectedRoute.role) {
      return NextResponse.redirect(new URL(dashboardForRole(role), request.url));
    }
  }

  if (session && role && guestOnlyRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL(dashboardForRole(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/patient/:path*", "/doctor/:path*", "/admin/:path*", "/login", "/register", "/forgot-password", "/reset-password"],
};
