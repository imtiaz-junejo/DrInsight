-- Author bio profile extensions
CREATE TYPE "AuthorType" AS ENUM (
  'DOCTOR',
  'MEDICAL_WRITER',
  'RESEARCHER',
  'HEALTHCARE_PROFESSIONAL',
  'EDITOR',
  'GUEST_AUTHOR',
  'MEDICAL_REVIEWER'
);

ALTER TABLE "doctor_profiles"
  ADD COLUMN "youtubeUrl" TEXT,
  ADD COLUMN "websiteUrl" TEXT,
  ADD COLUMN "orcidUrl" TEXT,
  ADD COLUMN "researchGateUrl" TEXT,
  ADD COLUMN "googleScholarUrl" TEXT,
  ADD COLUMN "facebookUrl" TEXT,
  ADD COLUMN "instagramUrl" TEXT,
  ADD COLUMN "authorType" "AuthorType" NOT NULL DEFAULT 'DOCTOR',
  ADD COLUMN "bookingEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "onlineAvailEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "physicalAvailEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "researchGrantsTotal" TEXT,
  ADD COLUMN "licenseBoard" TEXT,
  ADD COLUMN "verificationNote" TEXT;

CREATE TABLE "author_profile_feedback" (
  "id" TEXT NOT NULL,
  "doctorProfileId" TEXT NOT NULL,
  "helpful" BOOLEAN NOT NULL,
  "viewerKey" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "author_profile_feedback_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "author_profile_feedback_doctorProfileId_idx" ON "author_profile_feedback"("doctorProfileId");
CREATE INDEX "author_profile_feedback_viewerKey_idx" ON "author_profile_feedback"("viewerKey");

ALTER TABLE "author_profile_feedback"
  ADD CONSTRAINT "author_profile_feedback_doctorProfileId_fkey"
  FOREIGN KEY ("doctorProfileId") REFERENCES "doctor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
