import 'dotenv/config';
import { PrismaClient, QuestionStatus, UserRole } from '@prisma/client';
import { createPrismaClient } from '../src/prisma/create-prisma-client';
import { ADMIN_COUNT, DOCTOR_COUNT, SEED_DOMAIN } from './seed-data';
import {
  ASK_DOCTOR_COUNT,
  BLOG_CATEGORIES,
  BLOG_POST_COUNT,
  CONTACT_COUNT,
  NEWSLETTER_COUNT,
  buildAskDoctorQuestions,
  buildBlogPosts,
  buildContactSubmissions,
  buildNewsletterEmails,
} from './seed-content-data';
import { seedFeaturedBlogPosts } from './seed-featured-blog';
import { assertDevelopmentEnvironment } from './seed-shared';
import { mergeHeartHealthIntoCardiology } from './merge-heart-health';

export type ContentSeedStats = {
  blogCategories: { created: number; updated: number; total: number };
  blogPosts: { created: number; updated: number; total: number };
  featuredBlogPosts: { created: number; updated: number; total: number };
  askDoctorQuestions: { created: number; skipped: number; total: number };
  newsletterSubscribers: { created: number; updated: number; total: number };
  contactSubmissions: { created: number; skipped: number; total: number };
};

async function resolveBlogAuthors(prisma: PrismaClient) {
  const seedAdminEmails = Array.from({ length: ADMIN_COUNT }, (_, i) => `admin${i + 1}@${SEED_DOMAIN}`);

  let admins = await prisma.user.findMany({
    where: {
      role: UserRole.ADMIN,
      email: { in: seedAdminEmails },
    },
    orderBy: { email: 'asc' },
  });

  if (admins.length === 0) {
    admins = await prisma.user.findMany({
      where: { role: UserRole.ADMIN, status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
      take: ADMIN_COUNT,
    });
  }

  if (admins.length === 0) {
    throw new Error(
      'No admin users found for blog authorship. Run Phase 1 seed first to create users.',
    );
  }

  return admins;
}

async function resolveDoctors(prisma: PrismaClient) {
  const seedDoctorEmails = Array.from({ length: DOCTOR_COUNT }, (_, i) => `doctor${i + 1}@${SEED_DOMAIN}`);

  let doctors = await prisma.user.findMany({
    where: {
      role: UserRole.DOCTOR,
      email: { in: seedDoctorEmails },
    },
    orderBy: { email: 'asc' },
  });

  if (doctors.length === 0) {
    doctors = await prisma.user.findMany({
      where: { role: UserRole.DOCTOR, status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
      take: DOCTOR_COUNT,
    });
  }

  if (doctors.length === 0) {
    throw new Error(
      'No doctor users found for Ask Doctor answers. Run Phase 1 seed first to create users.',
    );
  }

  return doctors;
}

async function upsertBlogCategories(prisma: PrismaClient) {
  let created = 0;
  let updated = 0;

  await mergeHeartHealthIntoCardiology(prisma);

  for (const category of BLOG_CATEGORIES) {
    const existing = await prisma.blogCategory.findUnique({ where: { slug: category.slug } });
    await prisma.blogCategory.upsert({
      where: { slug: category.slug },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
      },
      update: {
        name: category.name,
        description: category.description,
      },
    });
    if (existing) updated += 1;
    else created += 1;
  }

  const categories = await prisma.blogCategory.findMany({ orderBy: { slug: 'asc' } });
  return { created, updated, total: categories.length, categories };
}

async function upsertBlogPosts(
  prisma: PrismaClient,
  categories: Array<{ id: string; slug: string }>,
  authors: Array<{ id: string }>,
) {
  const categoryBySlug = new Map(categories.map((category) => [category.slug, category.id]));
  const posts = buildBlogPosts();
  let created = 0;
  let updated = 0;

  for (let index = 0; index < posts.length; index++) {
    const post = posts[index]!;
    const categoryId = categoryBySlug.get(post.categorySlug);
    if (!categoryId) {
      throw new Error(`Missing blog category for slug "${post.categorySlug}".`);
    }

    const authorId = authors[index % authors.length]!.id;
    const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } });

    if (existing) {
      await prisma.blogPost.update({
        where: { slug: post.slug },
        data: {
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          coverImageUrl: post.coverImageUrl,
          categoryId,
          status: post.status,
          readTimeMinutes: post.readTimeMinutes,
          tags: post.tags,
          publishedAt: post.publishedAt,
        },
      });
      updated += 1;
    } else {
      await prisma.blogPost.create({
        data: {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverImageUrl: post.coverImageUrl,
          categoryId,
          authorId,
          status: post.status,
          readTimeMinutes: post.readTimeMinutes,
          viewCount: post.viewCount,
          tags: post.tags,
          publishedAt: post.publishedAt,
        },
      });
      created += 1;
    }
  }

  const total = await prisma.blogPost.count();
  return { created, updated, total };
}

async function upsertAskDoctorQuestions(
  prisma: PrismaClient,
  doctors: Array<{ id: string }>,
) {
  const questions = buildAskDoctorQuestions();
  let created = 0;
  let skipped = 0;

  for (const item of questions) {
    const existing = await prisma.askDoctorQuestion.findFirst({
      where: { question: item.question },
      select: { id: true },
    });

    if (existing) {
      await prisma.askDoctorQuestion.update({
        where: { id: existing.id },
        data: { helpfulCount: item.helpfulCount },
      });
      skipped += 1;
      continue;
    }

    await prisma.askDoctorQuestion.create({
      data: {
        category: item.category,
        question: item.question,
        answer: item.answer,
        submitterName: item.submitterName,
        isAnonymous: item.isAnonymous,
        helpfulCount: item.helpfulCount,
        status: item.status,
        answeredAt: item.answeredAt,
        answeredById:
          item.status === QuestionStatus.ANSWERED && item.doctorIndex !== null
            ? doctors[item.doctorIndex % doctors.length]!.id
            : null,
      },
    });
    created += 1;
  }

  const total = await prisma.askDoctorQuestion.count();
  return { created, skipped, total };
}

async function upsertNewsletterSubscribers(prisma: PrismaClient) {
  const emails = buildNewsletterEmails();
  let created = 0;
  let updated = 0;

  for (let index = 0; index < emails.length; index++) {
    const email = emails[index]!;
    const isActive = index % 17 !== 0;
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });

    await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: { email, isActive },
      update: { isActive },
    });

    if (existing) updated += 1;
    else created += 1;
  }

  const total = await prisma.newsletterSubscriber.count();
  return { created, updated, total };
}

async function upsertContactSubmissions(prisma: PrismaClient) {
  const submissions = buildContactSubmissions();
  let created = 0;
  let skipped = 0;

  for (const submission of submissions) {
    const existing = await prisma.contactSubmission.findFirst({
      where: {
        email: submission.email,
        subject: submission.subject,
        message: submission.message,
      },
      select: { id: true },
    });

    if (existing) {
      skipped += 1;
      continue;
    }

    await prisma.contactSubmission.create({
      data: {
        name: submission.name,
        email: submission.email,
        subject: submission.subject,
        message: submission.message,
        isRead: submission.isRead,
        createdAt: submission.createdAt,
      },
    });
    created += 1;
  }

  const total = await prisma.contactSubmission.count();
  return { created, skipped, total };
}

export async function seedContentPhase(prisma: PrismaClient): Promise<ContentSeedStats> {
  console.log('Starting Phase 2 content seed (incremental upsert)...');

  const authors = await resolveBlogAuthors(prisma);
  const doctors = await resolveDoctors(prisma);

  const categoryResult = await upsertBlogCategories(prisma);
  const blogPostResult = await upsertBlogPosts(prisma, categoryResult.categories, authors);
  const featuredBlogResult = await seedFeaturedBlogPosts(prisma);
  const askDoctorResult = await upsertAskDoctorQuestions(prisma, doctors);
  const newsletterResult = await upsertNewsletterSubscribers(prisma);
  const contactResult = await upsertContactSubmissions(prisma);

  if (
    categoryResult.total < BLOG_CATEGORIES.length ||
    blogPostResult.total < BLOG_POST_COUNT ||
    askDoctorResult.total < ASK_DOCTOR_COUNT ||
    newsletterResult.total < NEWSLETTER_COUNT ||
    contactResult.total < CONTACT_COUNT
  ) {
    throw new Error(
      `Content seed below expected totals: categories=${categoryResult.total}, posts=${blogPostResult.total}, questions=${askDoctorResult.total}, subscribers=${newsletterResult.total}, contacts=${contactResult.total}`,
    );
  }

  return {
    blogCategories: {
      created: categoryResult.created,
      updated: categoryResult.updated,
      total: categoryResult.total,
    },
    blogPosts: blogPostResult,
    featuredBlogPosts: featuredBlogResult,
    askDoctorQuestions: askDoctorResult,
    newsletterSubscribers: newsletterResult,
    contactSubmissions: contactResult,
  };
}

async function main() {
  assertDevelopmentEnvironment();

  const prisma = createPrismaClient();

  try {
    const stats = await seedContentPhase(prisma);
    console.log('Phase 2 content seed completed successfully.');
    console.log(stats);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Phase 2 content seed failed:', error);
    process.exit(1);
  });
}
