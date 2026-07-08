import {
  PrismaClient,
  PublicationAttachmentType,
  PublicationReviewAction,
  PublicationStatus,
  PublicationVisibility,
  UserRole,
} from '@prisma/client';
import {
  buildDoi,
  buildIssn,
  buildPublicationContent,
  COVER_IMAGES,
  OPEN_ACCESS_PDF_URLS,
  REVIEW_FEEDBACK,
  SEED_PUBLICATION_SLUG_PREFIX,
  SEED_PUBLICATION_TEMPLATES,
} from './seed-publications-data';

export type PublicationsSeedStats = {
  created: number;
  skipped: number;
  total: number;
  byStatus: Record<string, number>;
};

function randomInt(min: number, max: number, seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return Math.floor(min + (x - Math.floor(x)) * (max - min + 1));
}

function pickHospital(specialty: string, index: number): string {
  const hospitals = [
    'Aga Khan University Hospital',
    'Shaukat Khanum Memorial Cancer Hospital',
    'Jinnah Postgraduate Medical Centre',
    'Pakistan Institute of Medical Sciences',
    'Dow University of Health Sciences',
    'Combined Military Hospital',
  ];
  return hospitals[index % hospitals.length] ?? 'Aga Khan University Hospital';
}

function coAuthorNames(primaryLast: string, index: number): string[] {
  const pool = [
    'Dr. Sana Malik, MBBS',
    'Dr. Hira Shah, FCPS',
    'Dr. Omar Farooq, MD',
    'Dr. Aisha Khan, PhD',
    'Dr. Bilal Hussain, MRCP',
    'Dr. Nadia Qureshi, MBBS',
  ];
  return pool.filter((_, i) => (i + index) % 2 === 0).slice(0, 3 + (index % 3));
}

export async function seedPublications(prisma: PrismaClient): Promise<PublicationsSeedStats> {
  const existing = await prisma.publication.count({
    where: { slug: { startsWith: SEED_PUBLICATION_SLUG_PREFIX } },
  });

  if (existing >= SEED_PUBLICATION_TEMPLATES.length) {
    const byStatus = await prisma.publication.groupBy({
      by: ['status'],
      where: { slug: { startsWith: SEED_PUBLICATION_SLUG_PREFIX } },
      _count: true,
    });
    return {
      created: 0,
      skipped: existing,
      total: existing,
      byStatus: Object.fromEntries(byStatus.map((r) => [r.status, r._count])),
    };
  }

  const doctors = await prisma.doctorProfile.findMany({
    include: { user: true },
    orderBy: { createdAt: 'asc' },
  });

  if (doctors.length === 0) {
    throw new Error('No doctor profiles found. Run Phase 1 seed before seeding publications.');
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
    take: 40,
    orderBy: { createdAt: 'asc' },
  });

  const specialtyDoctorMap = new Map<string, typeof doctors>();
  for (const doc of doctors) {
    const key = doc.specialty;
    if (!specialtyDoctorMap.has(key)) specialtyDoctorMap.set(key, []);
    specialtyDoctorMap.get(key)!.push(doc);
  }

  let created = 0;
  let skipped = 0;
  const statusCounts: Record<string, number> = {};

  for (let i = 0; i < SEED_PUBLICATION_TEMPLATES.length; i++) {
    const template = SEED_PUBLICATION_TEMPLATES[i]!;
    const exists = await prisma.publication.findUnique({ where: { slug: template.slug } });
    if (exists) {
      skipped++;
      statusCounts[template.status] = (statusCounts[template.status] ?? 0) + 1;
      continue;
    }

    const specialtyDoctors = specialtyDoctorMap.get(template.specialty) ?? doctors;
    const doctor = specialtyDoctors[i % specialtyDoctors.length]!;
    const doctorUser = doctor.user;
    const primaryName = `Dr. ${doctorUser.firstName} ${doctorUser.lastName}, MBBS`;
    const content = buildPublicationContent(template);
    const doi = buildDoi(template.slug, i + 1);
    const issn = buildIssn(template.specialty);
    const pubDate = new Date(2024 + (i % 3), (i * 2) % 12, 1 + (i % 27));
    const submitDate = new Date(pubDate);
    submitDate.setMonth(submitDate.getMonth() - 2);
    const acceptDate = new Date(pubDate);
    acceptDate.setMonth(acceptDate.getMonth() - 1);

    const isApproved = template.status === PublicationStatus.APPROVED;
    const views = isApproved ? randomInt(420, 12400, i) : randomInt(0, 120, i);
    const downloads = isApproved ? randomInt(80, 2100, i + 7) : randomInt(0, 30, i);
    const citations = isApproved ? randomInt(3, 96, i + 13) : 0;
    const shares = isApproved ? randomInt(12, 340, i + 3) : 0;

    const publication = await prisma.publication.create({
      data: {
        doctorId: doctor.id,
        slug: template.slug,
        title: template.title,
        subtitle: template.subtitle,
        abstract: content.abstract,
        introduction: content.introduction,
        results: content.results,
        discussion: content.discussion,
        conclusion: content.conclusion,
        researchCategory: 'Clinical Research',
        medicalSpecialty: template.specialty,
        publicationType: template.publicationType,
        language: 'English',
        institution: pickHospital(template.specialty, i),
        department: `Department of ${template.specialty}`,
        orcid: `0000-0002-${String(1000 + i).padStart(4, '0')}-${String(7000 + i).padStart(4, '0')}`,
        correspondingAuthor: primaryName,
        journalName: template.journalName,
        publisher: template.publisher,
        volume: String(12 + (i % 8)),
        issue: String(1 + (i % 6)),
        pages: `${120 + i * 3}-${128 + i * 3}`,
        doi,
        issn,
        publicationDate: isApproved ? pubDate : null,
        acceptanceDate: isApproved ? acceptDate : null,
        submissionDate: submitDate,
        researchMethodology: content.methodology,
        studyDesign:
          template.publicationType === 'CLINICAL_TRIAL'
            ? 'Randomised controlled trial'
            : template.publicationType === 'CASE_STUDY'
              ? 'Retrospective case series'
              : 'Systematic review with narrative synthesis',
        sampleSize: `${randomInt(120, 2400, i)} participants`,
        fundingSource: i % 3 === 0 ? 'Institutional research grant' : 'No external funding',
        ethicalApprovalNumber: `IRB-2024-${String(1000 + i)}`,
        clinicalTrialRegistration:
          template.publicationType === 'CLINICAL_TRIAL' ? `NCT0${String(45000000 + i)}` : null,
        researchOverview: content.introduction,
        methodologySteps: content.methodology,
        partners: `${pickHospital(template.specialty, i)}, Independent Medical Reviewers`,
        referenceCount: randomInt(22, 64, i),
        reviewingPhysician: 'Dr. Javed Kumbhar, MBBS, RMP',
        physicianReviewed: isApproved,
        evidenceBased: true,
        openAccess: isApproved,
        fullyReferenced: true,
        coiDisclosed: true,
        doiUrl: `https://doi.org/${doi}`,
        journalUrl: `https://www.example-journal.org/article/${doi.replace(/\./g, '-')}`,
        pubmedUrl: `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(template.title)}`,
        googleScholarUrl: `https://scholar.google.com/scholar?q=${encodeURIComponent(template.title)}`,
        visibility: isApproved ? PublicationVisibility.PUBLIC : PublicationVisibility.AFTER_APPROVAL,
        seoTitle: `${template.title} | DrInsight Research`,
        metaDescription: content.abstract.slice(0, 155),
        status: template.status,
        featured: template.featured ?? false,
        pinned: template.pinned ?? false,
        featuredOrder: template.featuredOrder,
        viewCount: views,
        downloadCount: downloads,
        shareCount: shares,
        citationCount: citations,
        readTimeMinutes: randomInt(8, 18, i),
        assignedReviewerId:
          template.status === PublicationStatus.UNDER_REVIEW ? reviewer.id : null,
        submittedAt: submitDate,
        approvedAt: isApproved ? acceptDate : null,
        rejectedAt: template.status === PublicationStatus.REJECTED ? new Date() : null,
        publishedAt: isApproved ? pubDate : null,
        authors: {
          create: [
            {
              name: primaryName,
              role: 'Lead Author',
              orcid: `0000-0002-${String(1000 + i).padStart(4, '0')}-${String(7000 + i).padStart(4, '0')}`,
              affiliation: pickHospital(template.specialty, i),
              isPrimary: true,
              sortOrder: 0,
            },
            ...coAuthorNames(doctorUser.lastName, i).map((name, idx) => ({
              name,
              role: idx === 0 ? 'Co-Investigator' : 'Contributing Author',
              orcid: `0000-0003-${String(2000 + i + idx).padStart(4, '0')}-${String(8000 + i).padStart(4, '0')}`,
              affiliation: pickHospital(template.specialty, i + idx),
              isPrimary: false,
              sortOrder: idx + 1,
            })),
          ],
        },
        keywords: {
          create: content.keywords.map((keyword) => ({ keyword })),
        },
        attachments: {
          create: [
            {
              type: PublicationAttachmentType.COVER_IMAGE,
              fileName: 'cover.jpg',
              fileUrl: COVER_IMAGES[i % COVER_IMAGES.length]!,
              mimeType: 'image/jpeg',
              fileSize: 245000,
            },
            ...(isApproved || template.status === PublicationStatus.UNDER_REVIEW
              ? [
                  {
                    type: PublicationAttachmentType.PDF,
                    fileName: `${template.slug.split('-').pop()}.pdf`,
                    fileUrl: OPEN_ACCESS_PDF_URLS[i % OPEN_ACCESS_PDF_URLS.length]!,
                    mimeType: 'application/pdf',
                    fileSize: 1200000 + i * 10000,
                  },
                ]
              : []),
            ...(i % 4 === 0
              ? [
                  {
                    type: PublicationAttachmentType.SUPPLEMENTARY,
                    fileName: 'supplementary-tables.pdf',
                    fileUrl: OPEN_ACCESS_PDF_URLS[(i + 1) % OPEN_ACCESS_PDF_URLS.length]!,
                    mimeType: 'application/pdf',
                    fileSize: 450000,
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
          featured: template.featured ?? false,
          pinned: template.pinned ?? false,
        },
      });
    } else if (template.status === PublicationStatus.REJECTED) {
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
    } else if (template.status === PublicationStatus.NEEDS_REVISION) {
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
    }

    if (isApproved && patients.length > 0) {
      const bookmarkPatients = patients.slice(i % 10, (i % 10) + 2 + (i % 4));
      for (const patient of bookmarkPatients) {
        await prisma.publicationBookmark.upsert({
          where: {
            publicationId_userId: { publicationId: publication.id, userId: patient.id },
          },
          create: { publicationId: publication.id, userId: patient.id },
          update: {},
        });
      }
    }

    created++;
    statusCounts[template.status] = (statusCounts[template.status] ?? 0) + 1;
  }

  const total = await prisma.publication.count({
    where: { slug: { startsWith: SEED_PUBLICATION_SLUG_PREFIX } },
  });

  return { created, skipped, total, byStatus: statusCounts };
}
