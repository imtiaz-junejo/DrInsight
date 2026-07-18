-- Editorial Management System

-- Extend BlogStatus enum
ALTER TYPE "BlogStatus" ADD VALUE IF NOT EXISTS 'SUBMITTED';
ALTER TYPE "BlogStatus" ADD VALUE IF NOT EXISTS 'UNDER_MEDICAL_REVIEW';
ALTER TYPE "BlogStatus" ADD VALUE IF NOT EXISTS 'NEEDS_REVISION';
ALTER TYPE "BlogStatus" ADD VALUE IF NOT EXISTS 'APPROVED';
ALTER TYPE "BlogStatus" ADD VALUE IF NOT EXISTS 'REJECTED';

-- New enums
CREATE TYPE "ReviewPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
CREATE TYPE "EditorialReviewStageType" AS ENUM (
  'SUBMITTED',
  'EDITORIAL_SCREENING',
  'MEDICAL_REVIEW',
  'REVISION_REQUESTED',
  'FINAL_EDITORIAL_REVIEW',
  'APPROVED',
  'PUBLISHED'
);
CREATE TYPE "EditorialStageStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'SKIPPED');
CREATE TYPE "EditorialDocumentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "EditorialPolicyCategory" AS ENUM (
  'EDITORIAL_POLICY',
  'PUBLICATION_STANDARDS',
  'ETHICS_POLICY',
  'CONFLICT_OF_INTEREST',
  'CORRECTIONS_POLICY',
  'RETRACTION_POLICY',
  'PRIVACY_POLICY',
  'AI_CONTENT_POLICY',
  'ADVERTISEMENT_POLICY'
);
CREATE TYPE "AuthorGuidelineCategory" AS ENUM (
  'SUBMISSION_GUIDELINES',
  'FORMATTING_RULES',
  'REFERENCE_STYLE',
  'IMAGE_REQUIREMENTS',
  'CLINICAL_TRIAL_REQUIREMENTS',
  'ETHICS_REQUIREMENTS',
  'COPYRIGHT',
  'PUBLICATION_FEES',
  'OPEN_ACCESS_POLICY'
);
CREATE TYPE "ArticleReviewAction" AS ENUM (
  'SUBMIT',
  'ASSIGN_REVIEWER',
  'REASSIGN_REVIEWER',
  'APPROVE',
  'REJECT',
  'REQUEST_REVISION',
  'PUBLISH',
  'UNPUBLISH',
  'ARCHIVE',
  'FEATURE',
  'UNFEATURE',
  'PIN',
  'UNPIN',
  'DELETE',
  'MARK_COMPLETE',
  'REQUEST_CHANGES',
  'LEAVE_INTERNAL_NOTES',
  'LEAVE_MEDICAL_NOTES'
);

-- Blog post review fields
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "reviewPriority" "ReviewPriority" NOT NULL DEFAULT 'NORMAL';
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMP(3);
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3);
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "rejectedAt" TIMESTAMP(3);
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "revisionNotes" TEXT;

CREATE INDEX IF NOT EXISTS "blog_posts_reviewPriority_idx" ON "blog_posts"("reviewPriority");
CREATE INDEX IF NOT EXISTS "blog_posts_submittedAt_idx" ON "blog_posts"("submittedAt");

-- Article review history
CREATE TABLE "article_review_history" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "action" "ArticleReviewAction" NOT NULL,
  "fromStatus" "BlogStatus",
  "toStatus" "BlogStatus",
  "notes" TEXT,
  "internalNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "article_review_history_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "article_review_history_postId_createdAt_idx" ON "article_review_history"("postId", "createdAt");
CREATE INDEX "article_review_history_actorId_idx" ON "article_review_history"("actorId");
ALTER TABLE "article_review_history" ADD CONSTRAINT "article_review_history_postId_fkey" FOREIGN KEY ("postId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "article_review_history" ADD CONSTRAINT "article_review_history_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Editorial review workflow
CREATE TABLE "editorial_reviews" (
  "id" TEXT NOT NULL,
  "postId" TEXT,
  "publicationId" TEXT,
  "currentStage" "EditorialReviewStageType" NOT NULL DEFAULT 'SUBMITTED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "editorial_reviews_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "editorial_reviews_postId_key" ON "editorial_reviews"("postId");
CREATE UNIQUE INDEX "editorial_reviews_publicationId_key" ON "editorial_reviews"("publicationId");
CREATE INDEX "editorial_reviews_currentStage_idx" ON "editorial_reviews"("currentStage");
ALTER TABLE "editorial_reviews" ADD CONSTRAINT "editorial_reviews_postId_fkey" FOREIGN KEY ("postId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "editorial_reviews" ADD CONSTRAINT "editorial_reviews_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "publications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "editorial_review_stages" (
  "id" TEXT NOT NULL,
  "reviewId" TEXT NOT NULL,
  "stage" "EditorialReviewStageType" NOT NULL,
  "reviewerId" TEXT,
  "reviewDate" TIMESTAMP(3),
  "dueDate" TIMESTAMP(3),
  "status" "EditorialStageStatus" NOT NULL DEFAULT 'PENDING',
  "notes" TEXT,
  "medicalNotes" TEXT,
  "internalNotes" TEXT,
  "completedAt" TIMESTAMP(3),
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "editorial_review_stages_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "editorial_review_stages_reviewId_stage_key" ON "editorial_review_stages"("reviewId", "stage");
CREATE INDEX "editorial_review_stages_reviewId_displayOrder_idx" ON "editorial_review_stages"("reviewId", "displayOrder");
CREATE INDEX "editorial_review_stages_reviewerId_idx" ON "editorial_review_stages"("reviewerId");
ALTER TABLE "editorial_review_stages" ADD CONSTRAINT "editorial_review_stages_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "editorial_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "editorial_review_stages" ADD CONSTRAINT "editorial_review_stages_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Medical reviewers
CREATE TABLE "medical_reviewers" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tier" INTEGER NOT NULL DEFAULT 1,
  "specialty" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "maxWorkload" INTEGER NOT NULL DEFAULT 10,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "medical_reviewers_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "medical_reviewers_userId_key" ON "medical_reviewers"("userId");
CREATE INDEX "medical_reviewers_isActive_tier_idx" ON "medical_reviewers"("isActive", "tier");
ALTER TABLE "medical_reviewers" ADD CONSTRAINT "medical_reviewers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Editorial policies CMS
CREATE TABLE "editorial_policies" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "category" "EditorialPolicyCategory" NOT NULL,
  "version" TEXT NOT NULL DEFAULT '1.0',
  "effectiveDate" TIMESTAMP(3),
  "status" "EditorialDocumentStatus" NOT NULL DEFAULT 'DRAFT',
  "contentHtml" TEXT,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "metaKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "isCurrent" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "editorial_policies_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "editorial_policies_slug_key" ON "editorial_policies"("slug");
CREATE INDEX "editorial_policies_category_status_idx" ON "editorial_policies"("category", "status");
CREATE INDEX "editorial_policies_isCurrent_idx" ON "editorial_policies"("isCurrent");

CREATE TABLE "editorial_policy_versions" (
  "id" TEXT NOT NULL,
  "policyId" TEXT NOT NULL,
  "versionNumber" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "contentHtml" TEXT,
  "changeLog" TEXT,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "metaKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "isCurrent" BOOLEAN NOT NULL DEFAULT false,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "editorial_policy_versions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "editorial_policy_versions_policyId_versionNumber_key" ON "editorial_policy_versions"("policyId", "versionNumber");
CREATE INDEX "editorial_policy_versions_policyId_isCurrent_idx" ON "editorial_policy_versions"("policyId", "isCurrent");
ALTER TABLE "editorial_policy_versions" ADD CONSTRAINT "editorial_policy_versions_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "editorial_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "editorial_policy_versions" ADD CONSTRAINT "editorial_policy_versions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Author guidelines CMS
CREATE TABLE "author_guidelines" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "category" "AuthorGuidelineCategory" NOT NULL,
  "version" TEXT NOT NULL DEFAULT '1.0',
  "status" "EditorialDocumentStatus" NOT NULL DEFAULT 'DRAFT',
  "contentHtml" TEXT,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "metaKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "isCurrent" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "author_guidelines_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "author_guidelines_slug_key" ON "author_guidelines"("slug");
CREATE INDEX "author_guidelines_category_status_idx" ON "author_guidelines"("category", "status");
CREATE INDEX "author_guidelines_isCurrent_idx" ON "author_guidelines"("isCurrent");

CREATE TABLE "author_guideline_versions" (
  "id" TEXT NOT NULL,
  "guidelineId" TEXT NOT NULL,
  "versionNumber" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "contentHtml" TEXT,
  "changeLog" TEXT,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "metaKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "isCurrent" BOOLEAN NOT NULL DEFAULT false,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "author_guideline_versions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "author_guideline_versions_guidelineId_versionNumber_key" ON "author_guideline_versions"("guidelineId", "versionNumber");
CREATE INDEX "author_guideline_versions_guidelineId_isCurrent_idx" ON "author_guideline_versions"("guidelineId", "isCurrent");
ALTER TABLE "author_guideline_versions" ADD CONSTRAINT "author_guideline_versions_guidelineId_fkey" FOREIGN KEY ("guidelineId") REFERENCES "author_guidelines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "author_guideline_versions" ADD CONSTRAINT "author_guideline_versions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "author_guideline_attachments" (
  "id" TEXT NOT NULL,
  "guidelineId" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "fileSize" INTEGER,
  "mimeType" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "author_guideline_attachments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "author_guideline_attachments_guidelineId_idx" ON "author_guideline_attachments"("guidelineId");
ALTER TABLE "author_guideline_attachments" ADD CONSTRAINT "author_guideline_attachments_guidelineId_fkey" FOREIGN KEY ("guidelineId") REFERENCES "author_guidelines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
