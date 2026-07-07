-- Merge Heart Health blog category into Cardiology
DO $$
DECLARE
  heart_id TEXT;
  cardio_id TEXT;
  moved_count INTEGER;
BEGIN
  SELECT id INTO heart_id FROM blog_categories WHERE slug = 'heart-health';
  IF heart_id IS NULL THEN
    RETURN;
  END IF;

  SELECT id INTO cardio_id FROM blog_categories WHERE slug = 'cardiology';

  IF cardio_id IS NULL THEN
    UPDATE blog_categories
    SET
      name = 'Cardiology',
      slug = 'cardiology',
      description = COALESCE(
        description,
        'Cardiovascular prevention, hypertension, and heart disease awareness in Pakistan.'
      ),
      "updatedAt" = NOW()
    WHERE id = heart_id;
  ELSE
    UPDATE blog_posts
    SET "categoryId" = cardio_id, "updatedAt" = NOW()
    WHERE "categoryId" = heart_id;

    GET DIAGNOSTICS moved_count = ROW_COUNT;
    RAISE NOTICE 'Moved % blog posts from heart-health to cardiology', moved_count;

    DELETE FROM blog_categories WHERE id = heart_id;
  END IF;
END $$;
