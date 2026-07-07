-- CreateEnum
CREATE TYPE "BlogCommentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "blog_posts" ADD COLUMN     "subtitle" TEXT,
ADD COLUMN     "coverImageAlt" TEXT,
ADD COLUMN     "coverImageCaption" TEXT,
ADD COLUMN     "reviewerId" TEXT,
ADD COLUMN     "specialty" TEXT,
ADD COLUMN     "shareCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "summaryPoints" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "keyTakeaways" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "references" JSONB,
ADD COLUMN     "glossary" JSONB,
ADD COLUMN     "medicalDisclaimer" TEXT,
ADD COLUMN     "peerReviewed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastReviewedAt" TIMESTAMP(3),
ADD COLUMN     "seoTitle" TEXT,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "metaKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "canonicalUrl" TEXT,
ADD COLUMN     "averageRating" DOUBLE PRECISION,
ADD COLUMN     "ratingCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "helpfulYes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "helpfulNo" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "blog_comments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT,
    "content" TEXT NOT NULL,
    "isVerifiedPatient" BOOLEAN NOT NULL DEFAULT false,
    "status" "BlogCommentStatus" NOT NULL DEFAULT 'PENDING',
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "blog_posts_reviewerId_idx" ON "blog_posts"("reviewerId");

-- CreateIndex
CREATE INDEX "blog_posts_specialty_idx" ON "blog_posts"("specialty");

-- CreateIndex
CREATE INDEX "blog_comments_postId_idx" ON "blog_comments"("postId");

-- CreateIndex
CREATE INDEX "blog_comments_status_idx" ON "blog_comments"("status");

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "blog_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
