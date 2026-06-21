/**
 * Auth provider abstraction — swap JWT for Clerk or Auth.js without rewriting modules.
 * Current implementation: JwtAuthProvider (native JWT + refresh tokens)
 * Future: ClerkAuthProvider, AuthJsAuthProvider
 */

export interface AuthUserPayload {
  id: string;
  email: string;
  role: string;
}

export interface AuthProvider {
  validateToken(token: string): Promise<AuthUserPayload | null>;
  issueTokens(user: AuthUserPayload): Promise<{ accessToken: string; refreshToken: string }>;
  revokeRefreshToken(token: string): Promise<void>;
}

export const AUTH_PROVIDER = 'AUTH_PROVIDER';
