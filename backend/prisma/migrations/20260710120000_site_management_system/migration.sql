-- Site Management System

CREATE TYPE "FaqStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "ContentPublishStatus" AS ENUM ('DRAFT', 'PUBLISHED');

ALTER TYPE "ContactInquiryStatus" ADD VALUE IF NOT EXISTS 'ARCHIVED';

-- Contact submissions
ALTER TABLE "contact_submissions" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "contact_submissions" ADD COLUMN IF NOT EXISTS "inquiryType" TEXT NOT NULL DEFAULT 'GENERAL';
ALTER TABLE "contact_submissions" ADD COLUMN IF NOT EXISTS "assignedStaffId" TEXT;
ALTER TABLE "contact_submissions" ADD COLUMN IF NOT EXISTS "attachments" JSONB;
ALTER TABLE "contact_submissions" ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "contact_submissions_assignedStaffId_idx" ON "contact_submissions"("assignedStaffId");
CREATE INDEX IF NOT EXISTS "contact_submissions_inquiryType_idx" ON "contact_submissions"("inquiryType");

ALTER TABLE "contact_submissions" ADD CONSTRAINT "contact_submissions_assignedStaffId_fkey"
  FOREIGN KEY ("assignedStaffId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "contact_inquiry_replies" (
  "id" TEXT NOT NULL,
  "inquiryId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "isInternal" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "contact_inquiry_replies_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "contact_inquiry_replies_inquiryId_createdAt_idx" ON "contact_inquiry_replies"("inquiryId", "createdAt");
ALTER TABLE "contact_inquiry_replies" ADD CONSTRAINT "contact_inquiry_replies_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "contact_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "contact_inquiry_replies" ADD CONSTRAINT "contact_inquiry_replies_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "contact_inquiry_notes" (
  "id" TEXT NOT NULL,
  "inquiryId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "note" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "contact_inquiry_notes_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "contact_inquiry_notes_inquiryId_createdAt_idx" ON "contact_inquiry_notes"("inquiryId", "createdAt");
ALTER TABLE "contact_inquiry_notes" ADD CONSTRAINT "contact_inquiry_notes_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "contact_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "contact_inquiry_notes" ADD CONSTRAINT "contact_inquiry_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- FAQs
ALTER TABLE "faqs" ADD COLUMN IF NOT EXISTS "priority" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "faqs" ADD COLUMN IF NOT EXISTS "status" "FaqStatus" NOT NULL DEFAULT 'PUBLISHED';
ALTER TABLE "faqs" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "faqs" ADD COLUMN IF NOT EXISTS "relatedSpecialty" TEXT;
ALTER TABLE "faqs" ADD COLUMN IF NOT EXISTS "relatedService" TEXT;
CREATE INDEX IF NOT EXISTS "faqs_status_category_idx" ON "faqs"("status", "category");

-- Homepage sections
ALTER TABLE "homepage_sections" ADD COLUMN IF NOT EXISTS "status" "ContentPublishStatus" NOT NULL DEFAULT 'PUBLISHED';
ALTER TABLE "homepage_sections" ADD COLUMN IF NOT EXISTS "draftConfig" JSONB;
CREATE INDEX IF NOT EXISTS "homepage_sections_status_idx" ON "homepage_sections"("status");

-- SEO pages
ALTER TABLE "seo_page_settings" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "seo_page_settings" ADD COLUMN IF NOT EXISTS "metaKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "seo_page_settings" ADD COLUMN IF NOT EXISTS "canonicalUrl" TEXT;
ALTER TABLE "seo_page_settings" ADD COLUMN IF NOT EXISTS "ogTitle" TEXT;
ALTER TABLE "seo_page_settings" ADD COLUMN IF NOT EXISTS "ogDescription" TEXT;
ALTER TABLE "seo_page_settings" ADD COLUMN IF NOT EXISTS "ogImageUrl" TEXT;
ALTER TABLE "seo_page_settings" ADD COLUMN IF NOT EXISTS "twitterCard" TEXT DEFAULT 'summary_large_image';
ALTER TABLE "seo_page_settings" ADD COLUMN IF NOT EXISTS "robots" TEXT DEFAULT 'index,follow';
ALTER TABLE "seo_page_settings" ADD COLUMN IF NOT EXISTS "schemaJson" JSONB;
ALTER TABLE "seo_page_settings" ADD COLUMN IF NOT EXISTS "sitemapPriority" DOUBLE PRECISION DEFAULT 0.5;
ALTER TABLE "seo_page_settings" ADD COLUMN IF NOT EXISTS "status" "ContentPublishStatus" NOT NULL DEFAULT 'PUBLISHED';

-- Health tools
ALTER TABLE "health_tools" ADD COLUMN IF NOT EXISTS "category" TEXT;
ALTER TABLE "health_tools" ADD COLUMN IF NOT EXISTS "route" TEXT;
ALTER TABLE "health_tools" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "health_tools" ADD COLUMN IF NOT EXISTS "seoTitle" TEXT;
ALTER TABLE "health_tools" ADD COLUMN IF NOT EXISTS "seoDescription" TEXT;
ALTER TABLE "health_tools" ADD COLUMN IF NOT EXISTS "metaKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "health_tools" ADD COLUMN IF NOT EXISTS "settings" JSONB;
CREATE INDEX IF NOT EXISTS "health_tools_featured_idx" ON "health_tools"("featured");
CREATE INDEX IF NOT EXISTS "health_tools_category_idx" ON "health_tools"("category");
