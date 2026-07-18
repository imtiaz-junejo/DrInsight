-- BlogCategory CMS fields
ALTER TABLE "blog_categories" ADD COLUMN IF NOT EXISTS "parentId" TEXT;
ALTER TABLE "blog_categories" ADD COLUMN IF NOT EXISTS "icon" TEXT;
ALTER TABLE "blog_categories" ADD COLUMN IF NOT EXISTS "color" TEXT;
ALTER TABLE "blog_categories" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS "blog_categories_parentId_idx" ON "blog_categories"("parentId");
CREATE INDEX IF NOT EXISTS "blog_categories_isActive_idx" ON "blog_categories"("isActive");

ALTER TABLE "blog_categories"
  ADD CONSTRAINT "blog_categories_parentId_fkey"
  FOREIGN KEY ("parentId") REFERENCES "blog_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- BlogPost pinned
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "pinned" BOOLEAN NOT NULL DEFAULT false;

-- BlogTag tables
CREATE TABLE IF NOT EXISTS "blog_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_tags_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "blog_post_tags" (
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "blog_post_tags_pkey" PRIMARY KEY ("postId","tagId")
);

CREATE UNIQUE INDEX IF NOT EXISTS "blog_tags_name_key" ON "blog_tags"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "blog_tags_slug_key" ON "blog_tags"("slug");
CREATE INDEX IF NOT EXISTS "blog_tags_isActive_idx" ON "blog_tags"("isActive");
CREATE INDEX IF NOT EXISTS "blog_post_tags_tagId_idx" ON "blog_post_tags"("tagId");

ALTER TABLE "blog_post_tags"
  ADD CONSTRAINT "blog_post_tags_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "blog_post_tags"
  ADD CONSTRAINT "blog_post_tags_tagId_fkey"
  FOREIGN KEY ("tagId") REFERENCES "blog_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- BlogCommentStatus: add HIDDEN
ALTER TYPE "BlogCommentStatus" ADD VALUE IF NOT EXISTS 'HIDDEN';

-- Backfill blog_tags from existing post tag strings
INSERT INTO "blog_tags" ("id", "name", "slug", "isActive", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  tag_name,
  lower(regexp_replace(regexp_replace(trim(tag_name), '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')),
  true,
  NOW(),
  NOW()
FROM (
  SELECT DISTINCT trim(unnest("tags")) AS tag_name
  FROM "blog_posts"
  WHERE array_length("tags", 1) > 0
) AS distinct_tags
WHERE tag_name <> ''
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "blog_post_tags" ("postId", "tagId")
SELECT p."id", t."id"
FROM "blog_posts" p
CROSS JOIN LATERAL unnest(p."tags") AS tag_name
JOIN "blog_tags" t ON lower(t."slug") = lower(regexp_replace(regexp_replace(trim(tag_name), '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
ON CONFLICT DO NOTHING;
