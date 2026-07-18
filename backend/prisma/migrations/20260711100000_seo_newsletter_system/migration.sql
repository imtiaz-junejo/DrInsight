-- SEO global settings & Newsletter management

CREATE TYPE "NewsletterCampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENT');
CREATE TYPE "NewsletterAudience" AS ENUM ('ALL', 'ACTIVE');

ALTER TABLE "site_settings"
  ADD COLUMN IF NOT EXISTS "googleAnalyticsId" TEXT,
  ADD COLUMN IF NOT EXISTS "robotsTxt" TEXT,
  ADD COLUMN IF NOT EXISTS "sitemapXml" TEXT,
  ADD COLUMN IF NOT EXISTS "siteUrl" TEXT DEFAULT 'https://drinsight.org',
  ADD COLUMN IF NOT EXISTS "faviconUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "socialSharingImageUrl" TEXT;

ALTER TABLE "newsletter_subscribers"
  ADD COLUMN IF NOT EXISTS "source" TEXT DEFAULT 'website';

CREATE INDEX IF NOT EXISTS "newsletter_subscribers_isActive_createdAt_idx"
  ON "newsletter_subscribers"("isActive", "createdAt");

CREATE TABLE "newsletter_campaigns" (
  "id" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "previewText" TEXT,
  "bodyHtml" TEXT NOT NULL,
  "bodyText" TEXT,
  "articleLink" TEXT,
  "status" "NewsletterCampaignStatus" NOT NULL DEFAULT 'DRAFT',
  "audience" "NewsletterAudience" NOT NULL DEFAULT 'ACTIVE',
  "scheduledAt" TIMESTAMP(3),
  "sentAt" TIMESTAMP(3),
  "recipientCount" INTEGER NOT NULL DEFAULT 0,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "newsletter_campaigns_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "newsletter_campaigns_status_scheduledAt_idx" ON "newsletter_campaigns"("status", "scheduledAt");
CREATE INDEX "newsletter_campaigns_createdAt_idx" ON "newsletter_campaigns"("createdAt");

ALTER TABLE "newsletter_campaigns"
  ADD CONSTRAINT "newsletter_campaigns_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
