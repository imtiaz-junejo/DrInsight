import type { DoctorProfile } from "@/services/api-hooks";

export function authorProfileHref(profile: Pick<DoctorProfile, "id" | "profileSlug">): string {
  if (profile.profileSlug) return `/authors/${profile.profileSlug}`;
  return `/our-doctors/${profile.id}`;
}
