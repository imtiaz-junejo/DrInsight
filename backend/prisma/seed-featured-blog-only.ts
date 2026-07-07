import 'dotenv/config';
import { createPrismaClient } from '../src/prisma/create-prisma-client';
import { seedFeaturedBlogPosts } from './seed-featured-blog';
import { assertDevelopmentEnvironment } from './seed-shared';

async function main() {
  assertDevelopmentEnvironment();

  const prisma = createPrismaClient();

  try {
    const result = await seedFeaturedBlogPosts(prisma);
    console.log('Featured blog seed completed successfully.');
    console.log(result);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Featured blog seed failed:', error);
  process.exit(1);
});
