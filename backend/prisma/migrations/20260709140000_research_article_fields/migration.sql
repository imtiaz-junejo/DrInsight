-- AlterEnum
ALTER TYPE "PublicationType" ADD VALUE IF NOT EXISTS 'EVIDENCE_REVIEW';
ALTER TYPE "PublicationType" ADD VALUE IF NOT EXISTS 'CLINICAL_EXPLAINER';
ALTER TYPE "PublicationType" ADD VALUE IF NOT EXISTS 'META_SUMMARY';
ALTER TYPE "PublicationType" ADD VALUE IF NOT EXISTS 'PRACTICE_GUIDE';

-- AlterTable
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "articleId" TEXT;
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "license" TEXT;
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "abstractBackground" TEXT;
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "abstractMethods" TEXT;
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "abstractResults" TEXT;
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "abstractConclusions" TEXT;
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "objectives" TEXT;
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "methodsContent" TEXT;
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "methodsTable" TEXT;
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "figureData" TEXT;
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "figureCaption" TEXT;
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "resultSummary" TEXT;
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "practiceImplications" TEXT;
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "limitations" TEXT;
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "keyFindings" TEXT;
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "authorContributions" TEXT;
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "ethicsStatement" TEXT;
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "dataAvailabilityStatement" TEXT;
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "conflictsOfInterest" TEXT;
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "acknowledgments" TEXT;
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "abbreviations" TEXT;
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "lastReviewedDate" TIMESTAMP(3);
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "peerReviewOutcome" TEXT;
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "nextScheduledReview" TIMESTAMP(3);
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "evidenceGrade" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "publication_references" (
    "id" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "citation" TEXT NOT NULL,
    "doi" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "publication_references_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "publication_references_publicationId_idx" ON "publication_references"("publicationId");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "publication_references" ADD CONSTRAINT "publication_references_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "publications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
