-- CreateTable
CREATE TABLE "blog_post_ratings" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "raterKey" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_post_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "blog_post_ratings_postId_idx" ON "blog_post_ratings"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "blog_post_ratings_postId_raterKey_key" ON "blog_post_ratings"("postId", "raterKey");

-- AddForeignKey
ALTER TABLE "blog_post_ratings" ADD CONSTRAINT "blog_post_ratings_postId_fkey" FOREIGN KEY ("postId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
