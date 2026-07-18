-- Extended patient profile fields for complete-profile flow
ALTER TABLE "patient_profiles" ADD COLUMN IF NOT EXISTS "accountSubType" TEXT;
ALTER TABLE "patient_profiles" ADD COLUMN IF NOT EXISTS "healthInterests" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "patient_profiles" ADD COLUMN IF NOT EXISTS "contentPreference" TEXT;
ALTER TABLE "patient_profiles" ADD COLUMN IF NOT EXISTS "newsletterFrequency" TEXT;
ALTER TABLE "patient_profiles" ADD COLUMN IF NOT EXISTS "languagePreference" TEXT;

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profileCompletedAt" TIMESTAMP(3);
