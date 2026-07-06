import type { AuthUser } from "@/store/auth.store";

export function getApiOrigin() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
  return apiUrl.replace(/\/api\/v1\/?$/, "");
}

export function dashboardForRole(role: AuthUser["role"]) {
  if (role === "DOCTOR") return "/doctor";
  if (role === "ADMIN") return "/admin";
  return "/patient";
}

function matchesPathPrefix(path: string, prefix: string) {
  return path === prefix || path.startsWith(`${prefix}/`);
}

function requiredRoleForPath(path: string): AuthUser["role"] | null {
  if (matchesPathPrefix(path, "/admin")) return "ADMIN";
  if (matchesPathPrefix(path, "/doctor")) return "DOCTOR";
  if (matchesPathPrefix(path, "/patient")) return "PATIENT";
  return null;
}

export function resolvePostLoginPath(role: AuthUser["role"], redirect: string | null): string {
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return dashboardForRole(role);
  }
  const neededRole = requiredRoleForPath(redirect);
  if (neededRole && neededRole !== role) {
    return dashboardForRole(role);
  }
  return redirect;
}

export type OAuthProviderName = "google" | "facebook";

const OAUTH_REDIRECT_KEY = "oauth_redirect";

export function startOAuth(provider: OAuthProviderName, redirectPath?: string | null) {
  if (typeof window === "undefined") return;

  const redirect =
    redirectPath ?? new URLSearchParams(window.location.search).get("redirect");

  if (redirect) {
    sessionStorage.setItem(OAUTH_REDIRECT_KEY, redirect);
  }

  window.location.assign(`${getApiOrigin()}/api/v1/auth/${provider}`);
}

export function consumeOAuthRedirect(): string | null {
  if (typeof window === "undefined") return null;
  const redirect = sessionStorage.getItem(OAUTH_REDIRECT_KEY);
  sessionStorage.removeItem(OAUTH_REDIRECT_KEY);
  return redirect;
}

/** Clears any legacy OAuth loading flag left from older sessions. */
export function clearOAuthLoadingProvider() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("oauth_loading");
}

export function oauthProviderLabel(provider: OAuthProviderName) {
  return provider === "google" ? "Google" : "Facebook";
}

export function oauthContinueLabel(provider: OAuthProviderName) {
  return `Continue with ${oauthProviderLabel(provider)}`;
}
