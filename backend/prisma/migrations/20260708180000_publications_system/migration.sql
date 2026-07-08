-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_REVISION');

-- CreateEnum
CREATE TYPE "PublicationType" AS ENUM ('JOURNAL_ARTICLE', 'RESEARCH_PAPER', 'CASE_STUDY', 'CLINICAL_TRIAL', 'REVIEW_ARTICLE', 'CONFERENCE_PAPER', 'BOOK_CHAPTER', 'THESIS');

-- CreateEnum
CREATE TYPE "PublicationVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'AFTER_APPROVAL');

-- CreateEnum
CREATE TYPE "PublicationAttachmentType" AS ENUM ('PDF', 'COVER_IMAGE', 'SUPPLEMENTARY', 'DATASET', 'FIGURE', 'TABLE');

-- CreateEnum
CREATE TYPE "PublicationReviewAction" AS ENUM ('APPROVE', 'REJECT', 'REQUEST_REVISION', 'SUBMIT', 'ASSIGN_REVIEWER');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'PUBLICATION';

-- CreateTable
CREATE TABLE "publications" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "abstract" TEXT NOT NULL,
    "researchCategory" TEXT,
    "medicalSpecialty" TEXT,
    "publicationType" "PublicationType" NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'English',
    "institution" TEXT,
    "department" TEXT,
    "orcid" TEXT,
    "correspondingAuthor" TEXT,
    "journalName" TEXT,
    "publisher" TEXT,
    "volume" TEXT,
    "issue" TEXT,
    "pages" TEXT,
    "doi" TEXT,
    "issn" TEXT,
    "publicationDate" TIMESTAMP(3),
    "acceptanceDate" TIMESTAMP(3),
    "submissionDate" TIMESTAMP(3),
    "researchMethodology" TEXT,
    "studyDesign" TEXT,
    "sampleSize" TEXT,
    "fundingSource" TEXT,
    "ethicalApprovalNumber" TEXT,
    "clinicalTrialRegistration" TEXT,
    "researchOverview" TEXT,
    "methodologySteps" TEXT,
    "partners" TEXT,
    "referenceCount" INTEGER,
    "reviewingPhysician" TEXT,
    "physicianReviewed" BOOLEAN NOT NULL DEFAULT false,
    "evidenceBased" BOOLEAN NOT NULL DEFAULT false,
    "openAccess" BOOLEAN NOT NULL DEFAULT false,
    "fullyReferenced" BOOLEAN NOT NULL DEFAULT false,
    "coiDisclosed" BOOLEAN NOT NULL DEFAULT false,
    "doiUrl" TEXT,
    "journalUrl" TEXT,
    "pubmedUrl" TEXT,
    "googleScholarUrl" TEXT,
    "visibility" "PublicationVisibility" NOT NULL DEFAULT 'AFTER_APPROVAL',
    "seoTitle" TEXT,
    "metaDescription" TEXT,
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "featuredOrder" INTEGER,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "citationCount" INTEGER NOT NULL DEFAULT 0,
    "readTimeMinutes" INTEGER NOT NULL DEFAULT 5,
    "assignedReviewerId" TEXT,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publication_authors" (
    "id" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "orcid" TEXT,
    "affiliation" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "publication_authors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publication_keywords" (
    "id" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,

    CONSTRAINT "publication_keywords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publication_attachments" (
    "id" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "type" "PublicationAttachmentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "storageKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "publication_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publication_reviews" (
    "id" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "action" "PublicationReviewAction" NOT NULL,
    "internalNotes" TEXT,
    "feedback" TEXT,
    "visibility" "PublicationVisibility",
    "featured" BOOLEAN,
    "pinned" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "publication_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publication_revisions" (
    "id" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "revisionNotes" TEXT,
    "snapshot" JSONB,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "publication_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publication_views" (
    "id" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "viewerKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "publication_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publication_downloads" (
    "id" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "downloaderKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "publication_downloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publication_bookmarks" (
    "id" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "publication_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publication_citations" (
    "id" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "citedByKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "publication_citations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "publications_slug_key" ON "publications"("slug");

-- CreateIndex
CREATE INDEX "publications_doctorId_idx" ON "publications"("doctorId");

-- CreateIndex
CREATE INDEX "publications_status_idx" ON "publications"("status");

-- CreateIndex
CREATE INDEX "publications_publicationType_idx" ON "publications"("publicationType");

-- CreateIndex
CREATE INDEX "publications_medicalSpecialty_idx" ON "publications"("medicalSpecialty");

-- CreateIndex
CREATE INDEX "publications_featured_featuredOrder_idx" ON "publications"("featured", "featuredOrder");

-- CreateIndex
CREATE INDEX "publications_publishedAt_idx" ON "publications"("publishedAt");

-- CreateIndex
CREATE INDEX "publications_viewCount_idx" ON "publications"("viewCount");

-- CreateIndex
CREATE INDEX "publications_downloadCount_idx" ON "publications"("downloadCount");

-- CreateIndex
CREATE INDEX "publications_citationCount_idx" ON "publications"("citationCount");

-- CreateIndex
CREATE INDEX "publication_authors_publicationId_idx" ON "publication_authors"("publicationId");

-- CreateIndex
CREATE INDEX "publication_keywords_publicationId_idx" ON "publication_keywords"("publicationId");

-- CreateIndex
CREATE INDEX "publication_keywords_keyword_idx" ON "publication_keywords"("keyword");

-- CreateIndex
CREATE INDEX "publication_attachments_publicationId_idx" ON "publication_attachments"("publicationId");

-- CreateIndex
CREATE INDEX "publication_reviews_publicationId_idx" ON "publication_reviews"("publicationId");

-- CreateIndex
CREATE INDEX "publication_reviews_reviewerId_idx" ON "publication_reviews"("reviewerId");

-- CreateIndex
CREATE INDEX "publication_revisions_publicationId_idx" ON "publication_revisions"("publicationId");

-- CreateIndex
CREATE INDEX "publication_views_publicationId_idx" ON "publication_views"("publicationId");

-- CreateIndex
CREATE INDEX "publication_views_viewerKey_idx" ON "publication_views"("viewerKey");

-- CreateIndex
CREATE INDEX "publication_downloads_publicationId_idx" ON "publication_downloads"("publicationId");

-- CreateIndex
CREATE UNIQUE INDEX "publication_bookmarks_publicationId_userId_key" ON "publication_bookmarks"("publicationId", "userId");

-- CreateIndex
CREATE INDEX "publication_bookmarks_userId_idx" ON "publication_bookmarks"("userId");

-- CreateIndex
CREATE INDEX "publication_citations_publicationId_idx" ON "publication_citations"("publicationId");

-- AddForeignKey
ALTER TABLE "publications" ADD CONSTRAINT "publications_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publications" ADD CONSTRAINT "publications_assignedReviewerId_fkey" FOREIGN KEY ("assignedReviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_authors" ADD CONSTRAINT "publication_authors_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "publications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_keywords" ADD CONSTRAINT "publication_keywords_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "publications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_attachments" ADD CONSTRAINT "publication_attachments_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "publications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_reviews" ADD CONSTRAINT "publication_reviews_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "publications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_reviews" ADD CONSTRAINT "publication_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_revisions" ADD CONSTRAINT "publication_revisions_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "publications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_views" ADD CONSTRAINT "publication_views_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "publications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_downloads" ADD CONSTRAINT "publication_downloads_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "publications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_bookmarks" ADD CONSTRAINT "publication_bookmarks_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "publications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_bookmarks" ADD CONSTRAINT "publication_bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_citations" ADD CONSTRAINT "publication_citations_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "publications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
