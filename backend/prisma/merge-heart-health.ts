import type { PrismaClient } from '@prisma/client';

const CARDIOLOGY_DESCRIPTION =
  'Cardiovascular prevention, hypertension, and heart disease awareness in Pakistan.';

/**
 * Moves all blog posts from Heart Health to Cardiology and removes the Heart Health category.
 */
export async function mergeHeartHealthIntoCardiology(prisma: PrismaClient): Promise<{
  movedPosts: number;
  action: 'renamed' | 'merged' | 'none';
}> {
  const heart = await prisma.blogCategory.findUnique({ where: { slug: 'heart-health' } });
  if (!heart) {
    return { movedPosts: 0, action: 'none' };
  }

  const cardiology = await prisma.blogCategory.findUnique({ where: { slug: 'cardiology' } });

  if (!cardiology) {
    await prisma.blogCategory.update({
      where: { id: heart.id },
      data: {
        name: 'Cardiology',
        slug: 'cardiology',
        description: heart.description ?? CARDIOLOGY_DESCRIPTION,
      },
    });
    return { movedPosts: 0, action: 'renamed' };
  }

  const moved = await prisma.blogPost.updateMany({
    where: { categoryId: heart.id },
    data: { categoryId: cardiology.id },
  });

  await prisma.blogCategory.delete({ where: { id: heart.id } });

  return { movedPosts: moved.count, action: 'merged' };
}
