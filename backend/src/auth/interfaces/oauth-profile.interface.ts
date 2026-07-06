import { OAuthProvider } from '@prisma/client';

export interface OAuthProfile {
  provider: OAuthProvider;
  providerId: string;
  email?: string | null;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
}

export interface OAuthPendingProfile {
  provider: OAuthProvider;
  providerId: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
}

export interface OAuthSessionPayload {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    avatarUrl?: string | null;
    phone?: string | null;
    emailVerified: boolean;
    createdAt: Date;
    doctorProfile?: unknown;
    patientProfile?: unknown;
  };
}
