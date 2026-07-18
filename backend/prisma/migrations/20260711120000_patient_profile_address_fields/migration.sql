-- Patient profile address fields for complete-profile flow
ALTER TABLE "patient_profiles" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "patient_profiles" ADD COLUMN IF NOT EXISTS "province" TEXT;
ALTER TABLE "patient_profiles" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "patient_profiles" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "patient_profiles" ADD COLUMN IF NOT EXISTS "postalCode" TEXT;
