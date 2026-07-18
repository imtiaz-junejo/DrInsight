import {
  PrismaClient,
  PublicationAttachmentType,
  PublicationReviewAction,
  PublicationStatus,
  PublicationType,
  PublicationVisibility,
  UserRole,
} from '@prisma/client';
import {
  ARTICLE_TOPICS_BY_SPECIALTY,
  buildArticleId,
  buildDoi,
  buildIssn,
  buildRichPublicationContent,
  COVER_IMAGES,
  OPEN_ACCESS_PDF_URLS,
  REVIEW_FEEDBACK,
  type ArticleTopic,
} from './seed-publication-content';

export type PublicationsSeedStats = {
  deleted: number;
  created: number;
  doctors: number;
  approved: number;
  otherStatuses: number;
};

function randomInt(min: number, max: number, seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return Math.floor(min + (x - Math.floor(x)) * (max - min + 1));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function makeSlug(specialty: string, topicKey: string, globalIndex: number): string {
  const spec = slugify(specialty);
  return `drinsight-${spec}-${topicKey}-${globalIndex}`;
}

function publicationsPerDoctor(doctorIndex: number): number {
  return 3 + (doctorIndex % 3);
}

function statusForPublication(
  doctorIndex: number,
  pubIndex: number,
  totalForDoctor: number,
): PublicationStatus {
  if (pubIndex < totalForDoctor - 1) return PublicationStatus.APPROVED;
  const cycle: PublicationStatus[] = [
    PublicationStatus.DRAFT,
    PublicationStatus.SUBMITTED,
    PublicationStatus.UNDER_REVIEW,
    PublicationStatus.NEEDS_REVISION,
    PublicationStatus.APPROVED,
  ];
  return cycle[doctorIndex % cycle.length]!;
}

function coAuthorPool(primaryLast: string, index: number): string[] {
  const pool = [
    'Dr. Sana Malik, MBBS',
    'Dr. Hira Shah, FCPS',
    'Dr. Omar Farooq, MD',
    'Dr. Aisha Khan, PhD',
    'Dr. Bilal Hussain, MRCP',
    'Dr. Nadia Qureshi, MBBS',
  ];
  return pool.filter((name) => !name.includes(primaryLast)).slice(0, 1 + (index % 2));
}

function resolveSpecialty(specialty: string): string {
  const aliases: Record<string, string> = {
    'General Practice': 'General Medicine',
  };
  return aliases[specialty] ?? specialty;
}

function pickTopics(specialty: string, count: number, doctorIndex: number): ArticleTopic[] {
  const resolved = resolveSpecialty(specialty);
  const topics = ARTICLE_TOPICS_BY_SPECIALTY[resolved] ?? ARTICLE_TOPICS_BY_SPECIALTY['General Medicine']!;
  const offset = doctorIndex % topics.length;
  const picked: ArticleTopic[] = [];
  for (let i = 0; i < count; i++) {
    picked.push(topics[(offset + i) % topics.length]!);
  }
  return picked;
}

export async function clearAllPublicationData(prisma: PrismaClient): Promise<number> {
  const deleted = await prisma.$transaction([
    prisma.publicationBookmark.deleteMany(),
    prisma.publicationCitation.deleteMany(),
    prisma.publicationDownload.deleteMany(),
    prisma.publicationView.deleteMany(),
    prisma.publicationRevision.deleteMany(),
    prisma.publicationReview.deleteMany(),
    prisma.publicationReference.deleteMany(),
    prisma.publicationAttachment.deleteMany(),
    prisma.publicationKeyword.deleteMany(),
    prisma.publicationAuthor.deleteMany(),
    prisma.publication.deleteMany(),
  ]);

  await prisma.doctorProfile.updateMany({
    data: { publications: null },
  });

  return deleted.reduce((sum, r) => sum + r.count, 0);
}

export async function seedPublications(prisma: PrismaClient): Promise<PublicationsSeedStats> {
  console.log('Clearing all existing publication data...');
  const deleted = await clearAllPublicationData(prisma);
  console.log(`Deleted ${deleted} publication-related records.`);

  const doctors = await prisma.doctorProfile.findMany({
    where: {
      credentialsVerifiedAt: { not: null },
      user: { role: UserRole.DOCTOR, status: 'ACTIVE' },
    },
    include: { user: true },
    orderBy: { createdAt: 'asc' },
  });

  if (doctors.length === 0) {
    throw new Error('No verified active doctors found. Run Phase 1 seed before seeding publications.');
  }

  const admins = await prisma.user.findMany({
    where: { role: UserRole.ADMIN, status: 'ACTIVE' },
    take: 3,
    orderBy: { createdAt: 'asc' },
  });
  const reviewer = admins[0];
  if (!reviewer) {
    throw new Error('No admin user found for publication review records.');
  }

  const patients = await prisma.user.findMany({
    where: { role: UserRole.PATIENT, status: 'ACTIVE' },
    take: 50,
    orderBy: { createdAt: 'asc' },
  });

  let globalIndex = 0;
  let created = 0;
  let approved = 0;
  let otherStatuses = 0;
  let featuredOrder = 1;

  for (let doctorIndex = 0; doctorIndex < doctors.length; doctorIndex++) {
    const doctor = doctors[doctorIndex]!;
    const doctorUser = doctor.user;
    const specialty = doctor.specialty;
    const hospital = doctor.hospital ?? 'Aga Khan University Hospital';
    const primaryName = `Dr. ${doctorUser.firstName} ${doctorUser.lastName}${doctor.credentials ? `, ${doctor.credentials}` : ', MBBS'}`;
    const pubCount = publicationsPerDoctor(doctorIndex);
    const topics = pickTopics(specialty, pubCount, doctorIndex);

    for (let pubIndex = 0; pubIndex < pubCount; pubIndex++) {
      globalIndex++;
      const topic = topics[pubIndex]!;
      const status = statusForPublication(doctorIndex, pubIndex, pubCount);
      const isApproved = status === PublicationStatus.APPROVED;
      const content = buildRichPublicationContent(topic, specialty, primaryName, hospital, globalIndex);

      const slug = makeSlug(specialty, topic.key, globalIndex);
      const pubYear = 2024 + (globalIndex % 3);
      const articleId = buildArticleId(topic.publicationType, pubYear, globalIndex);
      const doi = buildDoi(globalIndex, slug);
      const issn = buildIssn(specialty);
      const pubDate = new Date(pubYear, (globalIndex * 2) % 12, 1 + (globalIndex % 27));
      const submitDate = new Date(pubDate);
      submitDate.setMonth(submitDate.getMonth() - 2);
      const acceptDate = new Date(pubDate);
      acceptDate.setMonth(acceptDate.getMonth() - 1);
      const lastReviewed = new Date(pubDate);
      lastReviewed.setMonth(lastReviewed.getMonth() - 1);
      const nextReview = new Date(pubDate);
      nextReview.setFullYear(nextReview.getFullYear() + 1);

      const abstract = [
        content.abstractBackground,
        content.abstractMethods,
        content.abstractResults,
        content.abstractConclusions,
      ].join('\n\n');

      const views = isApproved ? randomInt(800, 18500, globalIndex) : randomInt(0, 150, globalIndex);
      const downloads = isApproved ? randomInt(120, 3200, globalIndex + 7) : randomInt(0, 40, globalIndex);
      const citations = isApproved ? randomInt(5, 120, globalIndex + 13) : 0;
      const shares = isApproved ? randomInt(20, 480, globalIndex + 3) : 0;
      const shouldFeature = isApproved && featuredOrder <= 12 && globalIndex % 11 === 0;

      const publication = await prisma.publication.create({
        data: {
          doctorId: doctor.id,
          slug,
          title: topic.title,
          subtitle: topic.subtitle,
          abstract,
          abstractBackground: content.abstractBackground,
          abstractMethods: content.abstractMethods,
          abstractResults: content.abstractResults,
          abstractConclusions: content.abstractConclusions,
          introduction: content.introduction,
          objectives: content.objectives,
          methodsContent: content.methodsContent,
          methodsTable: content.methodsTable,
          results: content.results,
          figureData: content.figureData,
          figureCaption: content.figureCaption,
          resultSummary: content.resultSummary,
          discussion: content.discussion,
          practiceImplications: content.practiceImplications,
          limitations: content.limitations,
          conclusion: content.conclusion,
          keyFindings: content.keyFindings,
          authorContributions: content.authorContributions,
          ethicsStatement: content.ethicsStatement,
          clinicalTrialRegistration: content.clinicalTrialRegistration,
          dataAvailabilityStatement: content.dataAvailabilityStatement,
          fundingSource: content.fundingSource,
          conflictsOfInterest: content.conflictsOfInterest,
          acknowledgments: content.acknowledgments,
          abbreviations: content.abbreviations,
          articleId,
          license: 'CC BY 4.0',
          researchCategory: 'Clinical Evidence Review',
          medicalSpecialty: specialty,
          publicationType: topic.publicationType as PublicationType,
          language: 'English',
          institution: hospital,
          department: `Department of ${specialty}`,
          orcid: `0000-0002-${String(1000 + globalIndex).padStart(4, '0')}-${String(7000 + globalIndex).padStart(4, '0')}`,
          correspondingAuthor: primaryName,
          journalName: 'DrInsight Research & Publications',
          publisher: 'DrInsight Editorial Board',
          doi,
          issn,
          publicationDate: isApproved ? pubDate : null,
          acceptanceDate: isApproved ? acceptDate : null,
          submissionDate: submitDate,
          referenceCount: content.references.length,
          reviewingPhysician: 'Dr. Javed Kumbhar, MBBS, RMP',
          physicianReviewed: isApproved,
          evidenceBased: true,
          openAccess: isApproved,
          fullyReferenced: true,
          coiDisclosed: true,
          doiUrl: `https://doi.org/${doi}`,
          journalUrl: `https://www.drinsight.org/research-publications/${slug}`,
          pubmedUrl: `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(topic.title)}`,
          googleScholarUrl: `https://scholar.google.com/scholar?q=${encodeURIComponent(topic.title)}`,
          visibility: isApproved ? PublicationVisibility.PUBLIC : PublicationVisibility.AFTER_APPROVAL,
          seoTitle: `${topic.title} | DrInsight Research`,
          metaDescription: content.abstractBackground.slice(0, 155),
          status,
          featured: shouldFeature,
          pinned: shouldFeature && featuredOrder <= 3,
          featuredOrder: shouldFeature ? featuredOrder++ : null,
          viewCount: views,
          downloadCount: downloads,
          shareCount: shares,
          citationCount: citations,
          readTimeMinutes: content.readTimeMinutes,
          lastReviewedDate: isApproved ? lastReviewed : null,
          peerReviewOutcome: isApproved ? 'Accepted with minor revisions' : null,
          nextScheduledReview: isApproved ? nextReview : null,
          evidenceGrade: isApproved ? ['A1', 'A2', 'B+', 'B'][globalIndex % 4]! : null,
          assignedReviewerId:
            status === PublicationStatus.UNDER_REVIEW ? reviewer.id : isApproved ? reviewer.id : null,
          submittedAt: status !== PublicationStatus.DRAFT ? submitDate : null,
          approvedAt: isApproved ? acceptDate : null,
          rejectedAt: status === PublicationStatus.REJECTED ? new Date() : null,
          publishedAt: isApproved ? pubDate : null,
          authors: {
            create: [
              {
                name: primaryName,
                role: 'Lead Author',
                orcid: `0000-0002-${String(1000 + globalIndex).padStart(4, '0')}-${String(7000 + globalIndex).padStart(4, '0')}`,
                affiliation: `${hospital}, Department of ${specialty}`,
                isPrimary: true,
                sortOrder: 0,
              },
              ...coAuthorPool(doctorUser.lastName, globalIndex).map((name, idx) => ({
                name,
                role: idx === 0 ? 'Co-Investigator' : 'Contributing Author',
                orcid: `0000-0003-${String(2000 + globalIndex + idx).padStart(4, '0')}-${String(8000 + globalIndex).padStart(4, '0')}`,
                affiliation: hospital,
                isPrimary: false,
                sortOrder: idx + 1,
              })),
            ],
          },
          keywords: {
            create: topic.keywords.map((keyword) => ({ keyword })),
          },
          references: {
            create: content.references.map((ref, idx) => ({
              citation: ref.citation,
              doi: ref.doi || null,
              sortOrder: idx,
            })),
          },
          attachments: {
            create: [
              {
                type: PublicationAttachmentType.COVER_IMAGE,
                fileName: 'cover.jpg',
                fileUrl: COVER_IMAGES[globalIndex % COVER_IMAGES.length]!,
                mimeType: 'image/jpeg',
                fileSize: 245000,
              },
              ...(isApproved || status === PublicationStatus.UNDER_REVIEW
                ? [
                    {
                      type: PublicationAttachmentType.PDF,
                      fileName: `${topic.key}.pdf`,
                      fileUrl: OPEN_ACCESS_PDF_URLS[globalIndex % OPEN_ACCESS_PDF_URLS.length]!,
                      mimeType: 'application/pdf',
                      fileSize: 1200000 + globalIndex * 10000,
                    },
                  ]
                : []),
              ...(globalIndex % 3 === 0
                ? [
                    {
                      type: PublicationAttachmentType.SUPPLEMENTARY,
                      fileName: 'supplementary-tables.pdf',
                      fileUrl: OPEN_ACCESS_PDF_URLS[(globalIndex + 1) % OPEN_ACCESS_PDF_URLS.length]!,
                      mimeType: 'application/pdf',
                      fileSize: 450000,
                    },
                  ]
                : []),
              ...(globalIndex % 5 === 0
                ? [
                    {
                      type: PublicationAttachmentType.FIGURE,
                      fileName: 'figure-1.png',
                      fileUrl: COVER_IMAGES[(globalIndex + 2) % COVER_IMAGES.length]!,
                      mimeType: 'image/png',
                      fileSize: 180000,
                    },
                  ]
                : []),
            ],
          },
        },
      });

      await prisma.publicationReview.create({
        data: {
          publicationId: publication.id,
          reviewerId: doctorUser.id,
          action: PublicationReviewAction.SUBMIT,
        },
      });

      if (isApproved) {
        const fb = REVIEW_FEEDBACK.APPROVE;
        await prisma.publicationReview.create({
          data: {
            publicationId: publication.id,
            reviewerId: reviewer.id,
            action: PublicationReviewAction.APPROVE,
            internalNotes: fb.internalNotes,
            feedback: fb.feedback,
            visibility: PublicationVisibility.PUBLIC,
            featured: shouldFeature,
            pinned: shouldFeature && featuredOrder <= 4,
          },
        });
        approved++;
      } else if (status === PublicationStatus.REJECTED) {
        const fb = REVIEW_FEEDBACK.REJECT;
        await prisma.publicationReview.create({
          data: {
            publicationId: publication.id,
            reviewerId: reviewer.id,
            action: PublicationReviewAction.REJECT,
            internalNotes: fb.internalNotes,
            feedback: fb.feedback,
          },
        });
        otherStatuses++;
      } else if (status === PublicationStatus.NEEDS_REVISION) {
        const fb = REVIEW_FEEDBACK.REQUEST_REVISION;
        await prisma.publicationReview.create({
          data: {
            publicationId: publication.id,
            reviewerId: reviewer.id,
            action: PublicationReviewAction.REQUEST_REVISION,
            internalNotes: fb.internalNotes,
            feedback: fb.feedback,
          },
        });
        await prisma.publicationRevision.create({
          data: {
            publicationId: publication.id,
            revisionNotes: fb.feedback,
          },
        });
        otherStatuses++;
      } else {
        otherStatuses++;
      }

      if (isApproved && patients.length > 0) {
        const bookmarkPatients = patients.slice(globalIndex % 15, (globalIndex % 15) + 2 + (globalIndex % 3));
        await prisma.publicationBookmark.createMany({
          data: bookmarkPatients.map((patient) => ({
            publicationId: publication.id,
            userId: patient.id,
          })),
          skipDuplicates: true,
        });

        const viewCount = Math.min(views, 25);
        await prisma.publicationView.createMany({
          data: Array.from({ length: viewCount }, (_, v) => ({
            publicationId: publication.id,
            viewerKey: `seed-viewer-${globalIndex}-${v}`,
          })),
        });

        const downloadCount = Math.min(downloads, 15);
        await prisma.publicationDownload.createMany({
          data: Array.from({ length: downloadCount }, (_, d) => ({
            publicationId: publication.id,
            downloaderKey: `seed-downloader-${globalIndex}-${d}`,
          })),
        });

        const citationRecordCount = Math.min(citations, 20);
        await prisma.publicationCitation.createMany({
          data: Array.from({ length: citationRecordCount }, (_, c) => ({
            publicationId: publication.id,
            citedByKey: `seed-citation-${globalIndex}-${c}`,
          })),
        });
      }

      created++;
    }
  }

  console.log(
    `Seeded ${created} publications for ${doctors.length} verified doctors (${approved} approved, ${otherStatuses} other statuses).`,
  );

  return {
    deleted,
    created,
    doctors: doctors.length,
    approved,
    otherStatuses,
  };
}
