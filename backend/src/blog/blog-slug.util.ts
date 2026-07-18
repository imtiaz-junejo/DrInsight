export function slugifyText(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function uniqueBlogSlug(
  prisma: { blogPost: { findUnique: (args: { where: { slug: string } }) => Promise<{ id: string } | null> } },
  base: string,
): Promise<string> {
  const normalized = slugifyText(base) || 'article';
  let slug = normalized;
  let counter = 1;

  while (await prisma.blogPost.findUnique({ where: { slug } })) {
    slug = `${normalized}-${counter}`;
    counter += 1;
  }

  return slug;
}

export async function uniqueCategorySlug(
  prisma: { blogCategory: { findUnique: (args: { where: { slug: string } }) => Promise<{ id: string } | null> } },
  base: string,
  excludeId?: string,
): Promise<string> {
  const normalized = slugifyText(base) || 'category';
  let slug = normalized;
  let counter = 1;

  while (true) {
    const existing = await prisma.blogCategory.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) break;
    slug = `${normalized}-${counter}`;
    counter += 1;
  }

  return slug;
}

export async function uniqueTagSlug(
  prisma: { blogTag: { findUnique: (args: { where: { slug: string } }) => Promise<{ id: string } | null> } },
  base: string,
  excludeId?: string,
): Promise<string> {
  const normalized = slugifyText(base) || 'tag';
  let slug = normalized;
  let counter = 1;

  while (true) {
    const existing = await prisma.blogTag.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) break;
    slug = `${normalized}-${counter}`;
    counter += 1;
  }

  return slug;
}
