import type { AuthUser } from "@/store/auth.store";
import type { AccountType, SubType } from "@/components/auth/registration-constants";

export const PROFILE_FIELD_KEYS = [
  "accountSubType",
  "firstName",
  "lastName",
  "phone",
  "dateOfBirth",
  "gender",
  "city",
  "country",
  "emergencyContact",
  "healthInterests",
  "contentPreference",
  "newsletterFrequency",
  "languagePreference",
  "specialty",
  "licenseNumber",
  "regulatoryBody",
  "experienceYears",
  "clinicalInterests",
] as const;

export type ProfileFieldKey = (typeof PROFILE_FIELD_KEYS)[number];

export interface CompleteProfilePayload {
  accountType: AccountType;
  accountSubType?: SubType;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  country?: string;
  city?: string;
  address?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  allergies?: string;
  healthInterests?: string[];
  contentPreference?: string;
  newsletterFrequency?: string;
  languagePreference?: string;
  specialty?: string;
  licenseNumber?: string;
  regulatoryBody?: string;
  experienceYears?: number;
  clinicalInterests?: string[];
  contributions?: string[];
  avatarUrl?: string | null;
  licenseCertificateUrl?: string | null;
}

export interface ProfileCompletenessResponse {
  profileCompleted: boolean;
  requiresCompletion: boolean;
  missingFields: ProfileFieldKey[];
  accountType: AccountType;
  oauthProvider: "google" | "facebook" | null;
  profile: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    avatarUrl?: string | null;
    phone?: string | null;
    emailVerified?: boolean;
    accountSubType?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
    country?: string | null;
    city?: string | null;
    address?: string | null;
    bloodGroup?: string | null;
    emergencyContact?: string | null;
    allergies?: string[];
    healthInterests?: string[];
    contentPreference?: string | null;
    newsletterFrequency?: string | null;
    languagePreference?: string | null;
    specialty?: string | null;
    licenseNumber?: string | null;
    regulatoryBody?: string | null;
    experienceYears?: number | null;
    clinicalInterests?: string[];
    contributions?: string[];
    licenseCertificateUrl?: string | null;
  };
}

export function completeProfileUrl(redirectPath?: string | null) {
  if (!redirectPath || !redirectPath.startsWith("/") || redirectPath.startsWith("//")) {
    return "/complete-profile";
  }
  return `/complete-profile?redirect=${encodeURIComponent(redirectPath)}`;
}

export function profileToAuthUser(profile: ProfileCompletenessResponse["profile"]): AuthUser {
  return {
    id: profile.id,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    role: profile.role as AuthUser["role"],
    status: profile.status,
    avatarUrl: profile.avatarUrl,
    phone: profile.phone,
  };
}

export function providerLabel(provider: ProfileCompletenessResponse["oauthProvider"]) {
  if (provider === "google") return "Connected with Google";
  if (provider === "facebook") return "Connected with Facebook";
  return "Connected account";
}

export function initialsForName(firstName?: string, lastName?: string, email?: string) {
  const name = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  if (name && firstName?.toLowerCase() !== "user") return name.charAt(0).toUpperCase();
  if (email) return email.charAt(0).toUpperCase();
  return "?";
}

export function fieldNeedsInput(field: ProfileFieldKey, missingFields: ProfileFieldKey[], value?: string | null) {
  return missingFields.includes(field) || !value?.trim();
}
