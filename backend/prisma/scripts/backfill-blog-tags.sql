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
