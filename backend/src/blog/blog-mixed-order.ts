/** Preferred round-robin order for the blog “all articles” grid */
export const MIXED_CATEGORY_SLUG_PRIORITY = [
  'cardiology',
  'neurology',
  'child-care',
  'diabetes',
  'mental-health',
  'womens-health',
  'mens-health',
  'endocrinology',
  'nutrition',
  'fitness',
  'skin-care',
  'dental-care',
  'eye-care',
  'infectious-diseases',
  'general-health',
] as const;

export function orderCategorySlugs(slugs: string[]): string[] {
  const known = new Set(slugs);
  const ordered: string[] = [];

  for (const slug of MIXED_CATEGORY_SLUG_PRIORITY) {
    if (known.has(slug)) {
      ordered.push(slug);
      known.delete(slug);
    }
  }

  return [...ordered, ...[...known].sort()];
}

type PostWithCategory = {
  category?: { slug: string } | null;
  publishedAt?: Date | string | null;
};

export function interleavePostsByCategory<T extends PostWithCategory>(
  buckets: Map<string, T[]>,
  categoryOrder: string[],
): T[] {
  const queues = new Map(
    categoryOrder.map((slug) => [slug, [...(buckets.get(slug) ?? [])]] as [string, T[]]),
  );
  const overflow = [...buckets.entries()]
    .filter(([slug]) => !categoryOrder.includes(slug))
    .flatMap(([, posts]) => posts);

  const result: T[] = [];
  let progress = true;

  while (progress) {
    progress = false;
    for (const slug of categoryOrder) {
      const queue = queues.get(slug);
      if (queue?.length) {
        result.push(queue.shift()!);
        progress = true;
      }
    }
    if (overflow.length) {
      result.push(overflow.shift()!);
      progress = true;
    }
  }

  return result;
}
