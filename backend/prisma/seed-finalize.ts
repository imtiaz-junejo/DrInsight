import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { createPrismaClient } from '../src/prisma/create-prisma-client';
import { SEED_DOMAIN } from './seed-data';
import {
  SCHEMA_MODELS,
  SEED_MODEL_MINIMUMS,
  SchemaModel,
  assertDevelopmentEnvironment,
} from './seed-shared';

export type ModelCoverage = {
  model: SchemaModel;
  count: number;
  minimum: number;
  ok: boolean;
};

export type FinalizeSeedStats = {
  coverage: ModelCoverage[];
  allModelsCovered: boolean;
  doctorProfilesSynced: number;
  conversationsSynced: number;
  integrityIssues: string[];
};

async function countModels(prisma: PrismaClient): Promise<Record<SchemaModel, number>> {
  const [
    users,
    refreshTokens,
    doctorProfiles,
    patientProfiles,
    appointments,
    bookingDrafts,
    payments,
    blogCategories,
    blogPosts,
    conversations,
    messages,
    notifications,
    reviews,
    prescriptions,
    askDoctorQuestions,
    contactSubmissions,
    newsletterSubscribers,
  ] = await Promise.all([
    prisma.user.count({ where: { email: { endsWith: `@${SEED_DOMAIN}` } } }),
    prisma.refreshToken.count({ where: { user: { email: { endsWith: `@${SEED_DOMAIN}` } } } }),
    prisma.doctorProfile.count({ where: { user: { email: { endsWith: `@${SEED_DOMAIN}` } } } }),
    prisma.patientProfile.count({ where: { user: { email: { endsWith: `@${SEED_DOMAIN}` } } } }),
    prisma.appointment.count(),
    prisma.bookingDraft.count(),
    prisma.payment.count(),
    prisma.blogCategory.count(),
    prisma.blogPost.count(),
    prisma.conversation.count(),
    prisma.message.count(),
    prisma.notification.count(),
    prisma.review.count(),
    prisma.prescription.count(),
    prisma.askDoctorQuestion.count(),
    prisma.contactSubmission.count(),
    prisma.newsletterSubscriber.count(),
  ]);

  return {
    User: users,
    RefreshToken: refreshTokens,
    DoctorProfile: doctorProfiles,
    PatientProfile: patientProfiles,
    Appointment: appointments,
    BookingDraft: bookingDrafts,
    Payment: payments,
    BlogCategory: blogCategories,
    BlogPost: blogPosts,
    Conversation: conversations,
    Message: messages,
    Notification: notifications,
    Review: reviews,
    Prescription: prescriptions,
    AskDoctorQuestion: askDoctorQuestions,
    ContactSubmission: contactSubmissions,
    NewsletterSubscriber: newsletterSubscribers,
  };
}

async function verifyCoverage(counts: Record<SchemaModel, number>): Promise<ModelCoverage[]> {
  return SCHEMA_MODELS.map((model) => {
    const minimum = SEED_MODEL_MINIMUMS[model];
    const count = counts[model];
    return {
      model,
      count,
      minimum,
      ok: count >= minimum,
    };
  });
}

async function syncDoctorReviewAggregates(prisma: PrismaClient): Promise<number> {
  const aggregates = await prisma.review.groupBy({
    by: ['doctorId'],
    _avg: { rating: true },
    _count: { rating: true },
  });

  let synced = 0;
  for (const aggregate of aggregates) {
    const rating = Math.round((aggregate._avg.rating ?? 0) * 10) / 10;
    await prisma.doctorProfile.update({
      where: { id: aggregate.doctorId },
      data: {
        rating,
        reviewCount: aggregate._count.rating,
      },
    });
    synced += 1;
  }

  return synced;
}

async function syncConversationLastMessageAt(prisma: PrismaClient): Promise<number> {
  const conversations = await prisma.conversation.findMany({
    where: {
      messages: { some: {} },
      doctor: { user: { email: { endsWith: `@${SEED_DOMAIN}` } } },
    },
    select: {
      id: true,
      lastMessageAt: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  let synced = 0;
  for (const conversation of conversations) {
    const latest = conversation.messages[0];
    if (!latest) continue;

    if (!conversation.lastMessageAt || conversation.lastMessageAt < latest.createdAt) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: latest.createdAt },
      });
      synced += 1;
    }
  }

  return synced;
}

async function verifyReferentialIntegrity(prisma: PrismaClient): Promise<string[]> {
  const issues: string[] = [];

  const orphanPrescriptions = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint AS count
    FROM prescriptions p
    LEFT JOIN appointments a ON a.id = p."appointmentId"
    WHERE a.id IS NULL
  `;
  if (Number(orphanPrescriptions[0]?.count ?? 0) > 0) {
    issues.push(`Found ${orphanPrescriptions[0]?.count} prescription(s) without a valid appointment.`);
  }

  const orphanPayments = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint AS count
    FROM payments p
    LEFT JOIN booking_drafts b ON b.id = p."bookingDraftId"
    WHERE b.id IS NULL
  `;
  if (Number(orphanPayments[0]?.count ?? 0) > 0) {
    issues.push(`Found ${orphanPayments[0]?.count} payment(s) without a valid booking draft.`);
  }

  const orphanMessages = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint AS count
    FROM messages m
    LEFT JOIN conversations c ON c.id = m."conversationId"
    WHERE c.id IS NULL
  `;
  if (Number(orphanMessages[0]?.count ?? 0) > 0) {
    issues.push(`Found ${orphanMessages[0]?.count} message(s) without a valid conversation.`);
  }

  const duplicateReviewAppointments = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint AS count
    FROM (
      SELECT "appointmentId"
      FROM reviews
      WHERE "appointmentId" IS NOT NULL
      GROUP BY "appointmentId"
      HAVING COUNT(*) > 1
    ) duplicates
  `;
  if (Number(duplicateReviewAppointments[0]?.count ?? 0) > 0) {
    issues.push('Duplicate reviews linked to the same appointment were detected.');
  }

  return issues;
}

export async function seedFinalizePhase(prisma: PrismaClient): Promise<FinalizeSeedStats> {
  console.log('Starting Phase 4 finalize (verify coverage, sync aggregates, integrity checks)...');

  const counts = await countModels(prisma);
  const coverage = await verifyCoverage(counts);
  const allModelsCovered = coverage.every((row) => row.ok);

  if (!allModelsCovered) {
    const missing = coverage.filter((row) => !row.ok);
    throw new Error(
      `Seed coverage incomplete: ${missing.map((row) => `${row.model}=${row.count}/${row.minimum}`).join(', ')}`,
    );
  }

  const doctorProfilesSynced = await syncDoctorReviewAggregates(prisma);
  const conversationsSynced = await syncConversationLastMessageAt(prisma);
  const integrityIssues = await verifyReferentialIntegrity(prisma);

  if (integrityIssues.length > 0) {
    throw new Error(`Seed integrity check failed:\n- ${integrityIssues.join('\n- ')}`);
  }

  return {
    coverage,
    allModelsCovered,
    doctorProfilesSynced,
    conversationsSynced,
    integrityIssues,
  };
}

async function main() {
  assertDevelopmentEnvironment();

  const prisma = createPrismaClient();

  try {
    const stats = await seedFinalizePhase(prisma);
    console.log('Phase 4 finalize completed successfully.');
    console.log({
      allModelsCovered: stats.allModelsCovered,
      modelsVerified: stats.coverage.length,
      doctorProfilesSynced: stats.doctorProfilesSynced,
      conversationsSynced: stats.conversationsSynced,
      coverage: stats.coverage.map((row) => ({
        model: row.model,
        count: row.count,
        minimum: row.minimum,
      })),
    });
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Phase 4 finalize failed:', error);
    process.exit(1);
  });
}
