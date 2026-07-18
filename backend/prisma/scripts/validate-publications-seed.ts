import 'dotenv/config';
import { createPrismaClient } from '../../src/prisma/create-prisma-client';

const prisma = createPrismaClient();

async function main() {
  const approved = await prisma.publication.findMany({
    where: { status: 'APPROVED' },
    select: {
      slug: true,
      title: true,
      abstractBackground: true,
      methodsTable: true,
      keyFindings: true,
      figureData: true,
      publishedAt: true,
      _count: { select: { references: true, authors: true, keywords: true, attachments: true } },
    },
    take: 3,
  });

  const incomplete = await prisma.publication.count({
    where: {
      status: 'APPROVED',
      OR: [
        { abstractBackground: null },
        { methodsContent: null },
        { keyFindings: null },
        { figureData: null },
        { publishedAt: null },
        { references: { none: {} } },
      ],
    },
  });

  const total = await prisma.publication.count();
  const approvedCount = await prisma.publication.count({ where: { status: 'APPROVED' } });
  const doctorsWithPubs = await prisma.doctorProfile.count({
    where: {
      credentialsVerifiedAt: { not: null },
      submittedPublications: { some: { status: 'APPROVED' } },
    },
  });

  const verifiedDoctors = await prisma.doctorProfile.count({
    where: {
      credentialsVerifiedAt: { not: null },
      user: { role: 'DOCTOR', status: 'ACTIVE' },
    },
  });

  console.log(
    JSON.stringify(
      {
        total,
        approvedCount,
        verifiedDoctors,
        doctorsWithApprovedPubs: doctorsWithPubs,
        incompleteApproved: incomplete,
        sample: approved,
      },
      null,
      2,
    ),
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
