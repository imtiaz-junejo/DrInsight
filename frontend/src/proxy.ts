import { NextRequest, NextResponse } from "next/server";

const roleRoutes = [
  { prefix: "/consultation/patient", role: "PATIENT" },
  { prefix: "/consultation/doctor", role: "DOCTOR" },
  { prefix: "/patient", role: "PATIENT" },
  { prefix: "/doctor", role: "DOCTOR" },
  { prefix: "/admin", role: "ADMIN" },
] as const;

const guestOnlyRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

/** Match `/doctor` and `/doctor/...` but not `/doctors` or `/our-doctors`. */
function matchesPathPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

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

  try {
    const parsed = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as JwtPayload;
    if (!parsed.sub || !parsed.role) return null;
    if (parsed.exp && parsed.exp * 1000 <= Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("drinsight_access")?.value;
  const session = await verifyJwt(token);
  const role = session?.role;

  const protectedRoute = roleRoutes.find((route) => matchesPathPrefix(pathname, route.prefix));

  if (protectedRoute) {
    if (!session || !role) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (role !== protectedRoute.role) {
      return NextResponse.redirect(new URL(dashboardForRole(role), request.url));
    }

    return NextResponse.next();
  }

  if (session && role && guestOnlyRoutes.some((route) => matchesPathPrefix(pathname, route))) {
    return NextResponse.redirect(new URL(dashboardForRole(role), request.url));
  }

  // Admin is a fully isolated area: once logged in, an admin must never see
  // the public site (or any other role's dashboard). Every route above this
  // point is either an /admin/* route (returned early) or a guest-only auth
  // route (handled above), so anything reaching here is a public route.
  if (session && role === "ADMIN") {
    return NextResponse.redirect(new URL(dashboardForRole(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on every route except Next.js internals and static files, so admin
  // isolation and role-based redirects are enforced across the whole app,
  // not just the previously hard-coded dashboard/auth paths.
  matcher: ["/((?!_next/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff|woff2|ttf)$).*)"],
};
