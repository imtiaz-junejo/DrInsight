-- Doctor profile admin controls (contact toggle, secondary SEO keywords, COI date, author since override)
ALTER TABLE "doctor_profiles"
  ADD COLUMN "contactEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "seoSecondaryKeywords" TEXT,
  ADD COLUMN "coiUpdatedAt" TIMESTAMP(3),
  ADD COLUMN "authorSince" TEXT;
