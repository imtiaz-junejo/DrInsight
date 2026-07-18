-- Site configuration system (branding, menus, ads, integrations)

ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "officeHoursText" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "mapsUrl" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "siteName" TEXT DEFAULT 'The Dr Insight';
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "siteTitle" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "timezone" TEXT DEFAULT 'UTC';
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "defaultMetaKeywords" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "ogTitle" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "ogDescription" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "twitterHandle" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "globalSchemaJson" JSONB;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "logoUrl" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footerLogoUrl" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "heroImageUrl" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "wordmarkText" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "tagline" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "pageHeroImages" JSONB;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "headerMenu" JSONB;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footerMenu" JSONB;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "advertisements" JSONB;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "socialLinks" JSONB;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "smtpHost" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "smtpFrom" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "integrationSecrets" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "requireTwoFactor" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "site_media_assets" (
  "id" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "label" TEXT,
  "mimeType" TEXT,
  "sizeBytes" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "site_media_assets_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "site_media_assets_createdAt_idx" ON "site_media_assets"("createdAt");
