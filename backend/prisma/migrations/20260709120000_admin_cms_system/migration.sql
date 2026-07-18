-- CreateEnum
CREATE TYPE "ContactInquiryStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'RESOLVED');

-- CreateEnum
CREATE TYPE "AuditResult" AS ENUM ('SUCCESS', 'FAILED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "AuditSeverity" AS ENUM ('INFO', 'WARNING', 'SENSITIVE', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AuditCategory" AS ENUM ('ADMIN', 'AUTH', 'DATA_ACCESS', 'PAYMENTS', 'ERROR');

-- AlterTable
ALTER TABLE "site_settings"
ADD COLUMN "defaultMetaTitleSuffix" TEXT DEFAULT ' | DrInsight',
ADD COLUMN "defaultMetaDescription" TEXT,
ADD COLUMN "googleSearchConsole" TEXT,
ADD COLUMN "xmlSitemapUrl" TEXT DEFAULT 'https://drinsight.org/sitemap.xml';

-- AlterTable
ALTER TABLE "contact_submissions"
ADD COLUMN "status" "ContactInquiryStatus" NOT NULL DEFAULT 'NEW',
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "contact_submissions" SET "status" = 'RESOLVED' WHERE "isRead" = true;

CREATE INDEX "contact_submissions_status_idx" ON "contact_submissions"("status");

-- CreateTable
CREATE TABLE "audit_log_entries" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorName" TEXT NOT NULL,
    "actorRole" TEXT,
    "actorEmail" TEXT,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "ipAddress" TEXT,
    "result" "AuditResult" NOT NULL DEFAULT 'SUCCESS',
    "severity" "AuditSeverity" NOT NULL DEFAULT 'INFO',
    "category" "AuditCategory" NOT NULL DEFAULT 'ADMIN',
    "details" JSONB,
    "acknowledgedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_entries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "faqs" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "homepage_sections" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_sections_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seo_page_settings" (
    "id" TEXT NOT NULL,
    "pageName" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "metaTitle" TEXT NOT NULL,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_page_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cms_pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "heroSubtitle" TEXT,
    "lastUpdated" TIMESTAMP(3),
    "version" TEXT,
    "extra" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_pages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cms_page_sections" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contentHtml" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_page_sections_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "health_tools" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "iconEmoji" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_tools_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "health_tool_usages" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_tool_usages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "page_views" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "sessionId" TEXT,
    "durationSeconds" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_views_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "review_process_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "tier1MinYears" INTEGER NOT NULL DEFAULT 5,
    "tier2MinYears" INTEGER NOT NULL DEFAULT 7,
    "reviewDeadlineDays" INTEGER NOT NULL DEFAULT 7,
    "maxRevisionCycles" INTEGER NOT NULL DEFAULT 2,
    "authorRevisionWindowDays" INTEGER NOT NULL DEFAULT 5,
    "minSourcesPerArticle" INTEGER NOT NULL DEFAULT 5,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_process_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "content_currency_schedules" (
    "id" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "reviewCycleMonths" INTEGER NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_currency_schedules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "admin_roles" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_roles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "admin_permissions" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "admin_permissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "role_permissions" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId","permissionId")
);

CREATE UNIQUE INDEX "homepage_sections_slug_key" ON "homepage_sections"("slug");
CREATE INDEX "homepage_sections_isVisible_displayOrder_idx" ON "homepage_sections"("isVisible", "displayOrder");
CREATE UNIQUE INDEX "seo_page_settings_path_key" ON "seo_page_settings"("path");
CREATE UNIQUE INDEX "cms_pages_slug_key" ON "cms_pages"("slug");
CREATE INDEX "cms_page_sections_pageId_displayOrder_idx" ON "cms_page_sections"("pageId", "displayOrder");
CREATE UNIQUE INDEX "health_tools_slug_key" ON "health_tools"("slug");
CREATE INDEX "health_tools_isActive_displayOrder_idx" ON "health_tools"("isActive", "displayOrder");
CREATE INDEX "health_tool_usages_toolId_createdAt_idx" ON "health_tool_usages"("toolId", "createdAt");
CREATE INDEX "page_views_path_idx" ON "page_views"("path");
CREATE INDEX "page_views_sessionId_idx" ON "page_views"("sessionId");
CREATE INDEX "page_views_createdAt_idx" ON "page_views"("createdAt");
CREATE INDEX "page_views_referrer_idx" ON "page_views"("referrer");
CREATE UNIQUE INDEX "content_currency_schedules_contentType_key" ON "content_currency_schedules"("contentType");
CREATE UNIQUE INDEX "admin_roles_key_key" ON "admin_roles"("key");
CREATE UNIQUE INDEX "admin_permissions_key_key" ON "admin_permissions"("key");
CREATE INDEX "audit_log_entries_createdAt_idx" ON "audit_log_entries"("createdAt");
CREATE INDEX "audit_log_entries_category_idx" ON "audit_log_entries"("category");
CREATE INDEX "audit_log_entries_severity_idx" ON "audit_log_entries"("severity");
CREATE INDEX "audit_log_entries_result_idx" ON "audit_log_entries"("result");
CREATE INDEX "faqs_isActive_displayOrder_idx" ON "faqs"("isActive", "displayOrder");

ALTER TABLE "cms_page_sections" ADD CONSTRAINT "cms_page_sections_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "cms_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "health_tool_usages" ADD CONSTRAINT "health_tool_usages_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "health_tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "admin_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "admin_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
