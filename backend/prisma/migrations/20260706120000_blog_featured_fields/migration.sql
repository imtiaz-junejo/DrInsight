-- AlterTable
ALTER TABLE "blog_posts" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "blog_posts" ADD COLUMN "featuredOrder" INTEGER;

-- CreateIndex
CREATE INDEX "blog_posts_featured_featuredOrder_idx" ON "blog_posts"("featured", "featuredOrder");
