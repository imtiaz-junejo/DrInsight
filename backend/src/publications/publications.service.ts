import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  NotificationType,
  Prisma,
  PublicationReviewAction,
  PublicationStatus,
  PublicationVisibility,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import type {
  CreatePublicationDto,
  PublicationQueryDto,
  ReviewPublicationDto,
  UpdatePublicationDto,
} from './dto/publication.dto';

const PUBLICATION_INCLUDE = {
  doctor: {
    include: {
      user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
    },
  },
  assignedReviewer: { select: { id: true, firstName: true, lastName: true } },
  authors: { orderBy: { sortOrder: 'asc' as const } },
  keywords: true,
  attachments: true,
  references: { orderBy: { sortOrder: 'asc' as const } },
  reviews: {
    orderBy: { createdAt: 'desc' as const },
    include: { reviewer: { select: { id: true, firstName: true, lastName: true } } },
  },
} satisfies Prisma.PublicationInclude;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const EDITABLE_STATUSES: PublicationStatus[] = [PublicationStatus.DRAFT, PublicationStatus.NEEDS_REVISION];

function composeAbstract(dto: CreatePublicationDto | UpdatePublicationDto): string | undefined {
  const structured = [
    dto.abstractBackground,
    dto.abstractMethods,
    dto.abstractResults,
    dto.abstractConclusions,
  ]
    .map((part) => part?.trim())
    .filter(Boolean);
  if (structured.length) return structured.join('\n\n');
  return dto.abstract?.trim() || undefined;
}

function validateAbstract(dto: CreatePublicationDto | UpdatePublicationDto) {
  const abstract = composeAbstract(dto);
  if (!abstract || abstract.length < 10) {
    throw new BadRequestException(
      'Abstract must be at least 10 characters (provide structured abstract sections or a summary)',
    );
  }
  return abstract;
}

@Injectable()
export class PublicationsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  private async uniqueSlug(base: string, excludeId?: string): Promise<string> {
    let slug = slugify(base);
    if (!slug) slug = `publication-${Date.now()}`;
    let candidate = slug;
    let n = 1;
    while (true) {
      const existing = await this.prisma.publication.findFirst({
        where: { slug: candidate, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      });
      if (!existing) return candidate;
      candidate = `${slug}-${n++}`;
    }
  }

  private async getDoctorProfileId(userId: string) {
    const profile = await this.prisma.doctorProfile.findUnique({ where: { userId } });
    if (!profile) throw new ForbiddenException('Doctor profile not found');
    return profile.id;
  }

  private buildPublicationData(dto: CreatePublicationDto | UpdatePublicationDto) {
    const data: Prisma.PublicationUpdateInput = {};
    const scalarFields = [
      'title', 'subtitle', 'abstract', 'researchCategory', 'medicalSpecialty',
      'publicationType', 'language', 'institution', 'department', 'orcid',
      'correspondingAuthor', 'journalName', 'publisher', 'volume', 'issue', 'pages',
      'doi', 'issn', 'researchMethodology', 'studyDesign', 'sampleSize',
      'fundingSource', 'ethicalApprovalNumber', 'clinicalTrialRegistration',
      'researchOverview', 'methodologySteps', 'partners', 'referenceCount',
      'reviewingPhysician', 'physicianReviewed', 'evidenceBased', 'openAccess',
      'fullyReferenced', 'coiDisclosed', 'doiUrl', 'journalUrl', 'pubmedUrl',
      'googleScholarUrl', 'visibility', 'seoTitle', 'metaDescription', 'readTimeMinutes',
      'introduction', 'results', 'discussion', 'conclusion',
      'articleId', 'license', 'abstractBackground', 'abstractMethods', 'abstractResults',
      'abstractConclusions', 'objectives', 'methodsContent', 'methodsTable', 'figureData',
      'figureCaption', 'resultSummary', 'practiceImplications', 'limitations',
      'keyFindings', 'authorContributions', 'ethicsStatement', 'dataAvailabilityStatement',
      'conflictsOfInterest', 'acknowledgments', 'abbreviations',
    ] as const;

    for (const field of scalarFields) {
      if (dto[field] !== undefined) (data as Record<string, unknown>)[field] = dto[field];
    }

    const composedAbstract = composeAbstract(dto);
    if (composedAbstract) data.abstract = composedAbstract;

    if (dto.publicationDate) data.publicationDate = new Date(dto.publicationDate);
    if (dto.acceptanceDate) data.acceptanceDate = new Date(dto.acceptanceDate);
    if (dto.submissionDate) data.submissionDate = new Date(dto.submissionDate);

    if (dto.references) {
      data.referenceCount = dto.references.filter((ref) => ref.citation?.trim()).length;
    }

    return data;
  }

  private async syncAuthors(publicationId: string, authors?: CreatePublicationDto['authors']) {
    if (!authors) return;
    await this.prisma.publicationAuthor.deleteMany({ where: { publicationId } });
    if (authors.length) {
      await this.prisma.publicationAuthor.createMany({
        data: authors.map((a, i) => ({
          publicationId,
          name: a.name,
          role: a.role,
          orcid: a.orcid,
          affiliation: a.affiliation,
          isPrimary: a.isPrimary ?? i === 0,
          sortOrder: a.sortOrder ?? i,
        })),
      });
    }
  }

  private async syncKeywords(publicationId: string, keywords?: string[]) {
    if (!keywords) return;
    await this.prisma.publicationKeyword.deleteMany({ where: { publicationId } });
    const unique = [...new Set(keywords.map((k) => k.trim()).filter(Boolean))];
    if (unique.length) {
      await this.prisma.publicationKeyword.createMany({
        data: unique.map((keyword) => ({ publicationId, keyword })),
      });
    }
  }

  private async syncAttachments(publicationId: string, attachments?: CreatePublicationDto['attachments']) {
    if (!attachments) return;
    await this.prisma.publicationAttachment.deleteMany({ where: { publicationId } });
    if (attachments.length) {
      await this.prisma.publicationAttachment.createMany({
        data: attachments.map((a) => ({
          publicationId,
          type: a.type,
          fileName: a.fileName,
          fileUrl: a.fileUrl,
          fileSize: a.fileSize,
          mimeType: a.mimeType,
          storageKey: a.storageKey,
        })),
      });
    }
  }

  private async syncReferences(publicationId: string, references?: CreatePublicationDto['references']) {
    if (!references) return;
    await this.prisma.publicationReference.deleteMany({ where: { publicationId } });
    const valid = references.filter((ref) => ref.citation?.trim());
    if (valid.length) {
      await this.prisma.publicationReference.createMany({
        data: valid.map((ref, index) => ({
          publicationId,
          citation: ref.citation.trim(),
          doi: ref.doi?.trim() || null,
          sortOrder: ref.sortOrder ?? index,
        })),
      });
    }
  }

  private async notifyAdminsNewSubmission(publication: { id: string; title: string }) {
    const admins = await this.prisma.user.findMany({
      where: { role: UserRole.ADMIN, status: 'ACTIVE' },
      select: { id: true },
    });
    await Promise.all(
      admins.map((admin) =>
        this.notifications.create(admin.id, {
          type: NotificationType.PUBLICATION,
          title: 'New publication submitted',
          body: `"${publication.title}" is awaiting review.`,
          data: { publicationId: publication.id },
        }),
      ),
    );
  }

  private async notifyDoctorStatus(
    doctorUserId: string,
    publication: { id: string; title: string },
    status: PublicationStatus,
    feedback?: string,
  ) {
    const messages: Record<string, string> = {
      APPROVED: 'Your publication has been approved and published.',
      REJECTED: 'Your publication was rejected.',
      NEEDS_REVISION: 'Your publication needs revisions before it can be approved.',
      UNDER_REVIEW: 'Your publication is now under review.',
      SUBMITTED: 'Your publication has been submitted for review.',
    };
    await this.notifications.create(doctorUserId, {
      type: NotificationType.PUBLICATION,
      title: `Publication ${status.replace('_', ' ').toLowerCase()}`,
      body: feedback ?? messages[status] ?? `Status updated for "${publication.title}".`,
      data: { publicationId: publication.id, status },
    });
  }

  async create(userId: string, dto: CreatePublicationDto) {
    const doctorId = await this.getDoctorProfileId(userId);
    const slug = await this.uniqueSlug(dto.slug ?? dto.title);
    const submit = dto.submitForReview === true;
    const abstract = validateAbstract(dto);
    const publicationData = this.buildPublicationData(dto);

    const publication = await this.prisma.publication.create({
      data: {
        doctor: { connect: { id: doctorId } },
        slug,
        title: dto.title,
        abstract,
        publicationType: dto.publicationType,
        language: dto.language ?? 'English',
        visibility: dto.visibility ?? PublicationVisibility.AFTER_APPROVAL,
        seoTitle: dto.seoTitle ?? dto.title,
        metaDescription: dto.metaDescription ?? abstract.slice(0, 160),
        readTimeMinutes: dto.readTimeMinutes ?? 5,
        physicianReviewed: dto.physicianReviewed ?? false,
        evidenceBased: dto.evidenceBased ?? false,
        openAccess: dto.openAccess ?? false,
        fullyReferenced: dto.fullyReferenced ?? false,
        coiDisclosed: dto.coiDisclosed ?? false,
        status: submit ? PublicationStatus.SUBMITTED : PublicationStatus.DRAFT,
        submittedAt: submit ? new Date() : undefined,
        ...publicationData,
      } as Prisma.PublicationCreateInput,
    });

    await this.syncAuthors(publication.id, dto.authors);
    await this.syncKeywords(publication.id, dto.keywords);
    await this.syncAttachments(publication.id, dto.attachments);
    await this.syncReferences(publication.id, dto.references);

    if (submit) {
      await this.prisma.publicationReview.create({
        data: {
          publicationId: publication.id,
          reviewerId: userId,
          action: PublicationReviewAction.SUBMIT,
        },
      });
      await this.notifyAdminsNewSubmission(publication);
      await this.notifyDoctorStatus(userId, publication, PublicationStatus.SUBMITTED);
    }

    return this.findById(publication.id, userId, UserRole.DOCTOR);
  }

  async update(id: string, userId: string, role: UserRole, dto: UpdatePublicationDto) {
    const pub = await this.prisma.publication.findUnique({
      where: { id },
      include: { doctor: true },
    });
    if (!pub) throw new NotFoundException('Publication not found');

    if (role === UserRole.DOCTOR) {
      const doctorId = await this.getDoctorProfileId(userId);
      if (pub.doctorId !== doctorId) throw new ForbiddenException();
      if (!EDITABLE_STATUSES.includes(pub.status)) {
        throw new BadRequestException('Only drafts or publications needing revision can be edited');
      }
    } else if (role !== UserRole.ADMIN) {
      throw new ForbiddenException();
    }

    const data = this.buildPublicationData(dto);
    if (dto.title && dto.slug === undefined) {
      data.slug = await this.uniqueSlug(dto.title, id);
    } else if (dto.slug) {
      data.slug = await this.uniqueSlug(dto.slug, id);
    }

    const submit = dto.submitForReview === true;
    if (submit && pub.status !== PublicationStatus.SUBMITTED) {
      data.status = PublicationStatus.SUBMITTED;
      data.submittedAt = new Date();
    }

    await this.prisma.publication.update({ where: { id }, data });
    await this.syncAuthors(id, dto.authors);
    await this.syncKeywords(id, dto.keywords);
    await this.syncAttachments(id, dto.attachments);
    await this.syncReferences(id, dto.references);

    if (submit && pub.status !== PublicationStatus.SUBMITTED) {
      await this.prisma.publicationReview.create({
        data: { publicationId: id, reviewerId: userId, action: PublicationReviewAction.SUBMIT },
      });
      await this.notifyAdminsNewSubmission(pub);
      await this.notifyDoctorStatus(pub.doctor.userId, pub, PublicationStatus.SUBMITTED);
    }

    return this.findById(id, userId, role);
  }

  async submit(id: string, userId: string) {
    const doctorId = await this.getDoctorProfileId(userId);
    const pub = await this.prisma.publication.findFirst({ where: { id, doctorId } });
    if (!pub) throw new NotFoundException('Publication not found');
    if (!EDITABLE_STATUSES.includes(pub.status)) {
      throw new BadRequestException('Publication cannot be submitted in its current status');
    }

    const updated = await this.prisma.publication.update({
      where: { id },
      data: { status: PublicationStatus.SUBMITTED, submittedAt: new Date() },
    });

    await this.prisma.publicationReview.create({
      data: { publicationId: id, reviewerId: userId, action: PublicationReviewAction.SUBMIT },
    });
    await this.notifyAdminsNewSubmission(updated);
    await this.notifyDoctorStatus(userId, updated, PublicationStatus.SUBMITTED);

    return this.findById(id, userId, UserRole.DOCTOR);
  }

  async remove(id: string, userId: string, role: UserRole) {
    const pub = await this.prisma.publication.findUnique({ where: { id }, include: { doctor: true } });
    if (!pub) throw new NotFoundException('Publication not found');

    if (role === UserRole.DOCTOR) {
      const doctorId = await this.getDoctorProfileId(userId);
      if (pub.doctorId !== doctorId) throw new ForbiddenException();
      if (pub.status !== PublicationStatus.DRAFT) {
        throw new BadRequestException('Only draft publications can be deleted');
      }
    } else if (role !== UserRole.ADMIN) {
      throw new ForbiddenException();
    }

    await this.prisma.publication.delete({ where: { id } });
    return { success: true };
  }

  async duplicate(id: string, userId: string) {
    const doctorId = await this.getDoctorProfileId(userId);
    const pub = await this.prisma.publication.findFirst({
      where: { id, doctorId },
      include: { authors: true, keywords: true, attachments: true },
    });
    if (!pub) throw new NotFoundException('Publication not found');

    const slug = await this.uniqueSlug(`${pub.title}-copy`);
    const copy = await this.prisma.publication.create({
      data: {
        doctorId,
        slug,
        title: `${pub.title} (Copy)`,
        subtitle: pub.subtitle,
        abstract: pub.abstract,
        researchCategory: pub.researchCategory,
        medicalSpecialty: pub.medicalSpecialty,
        publicationType: pub.publicationType,
        language: pub.language,
        institution: pub.institution,
        department: pub.department,
        orcid: pub.orcid,
        correspondingAuthor: pub.correspondingAuthor,
        journalName: pub.journalName,
        publisher: pub.publisher,
        volume: pub.volume,
        issue: pub.issue,
        pages: pub.pages,
        doi: pub.doi,
        issn: pub.issn,
        researchMethodology: pub.researchMethodology,
        studyDesign: pub.studyDesign,
        sampleSize: pub.sampleSize,
        fundingSource: pub.fundingSource,
        ethicalApprovalNumber: pub.ethicalApprovalNumber,
        clinicalTrialRegistration: pub.clinicalTrialRegistration,
        researchOverview: pub.researchOverview,
        methodologySteps: pub.methodologySteps,
        partners: pub.partners,
        referenceCount: pub.referenceCount,
        reviewingPhysician: pub.reviewingPhysician,
        physicianReviewed: pub.physicianReviewed,
        evidenceBased: pub.evidenceBased,
        openAccess: pub.openAccess,
        fullyReferenced: pub.fullyReferenced,
        coiDisclosed: pub.coiDisclosed,
        doiUrl: pub.doiUrl,
        journalUrl: pub.journalUrl,
        pubmedUrl: pub.pubmedUrl,
        googleScholarUrl: pub.googleScholarUrl,
        visibility: pub.visibility,
        seoTitle: pub.seoTitle,
        metaDescription: pub.metaDescription,
        readTimeMinutes: pub.readTimeMinutes,
        status: PublicationStatus.DRAFT,
      },
    });

    if (pub.authors.length) {
      await this.prisma.publicationAuthor.createMany({
        data: pub.authors.map((a) => ({
          publicationId: copy.id,
          name: a.name,
          role: a.role,
          orcid: a.orcid,
          affiliation: a.affiliation,
          isPrimary: a.isPrimary,
          sortOrder: a.sortOrder,
        })),
      });
    }
    if (pub.keywords.length) {
      await this.prisma.publicationKeyword.createMany({
        data: pub.keywords.map((k) => ({ publicationId: copy.id, keyword: k.keyword })),
      });
    }

    return this.findById(copy.id, userId, UserRole.DOCTOR);
  }

  async findById(id: string, userId?: string, role?: UserRole) {
    const pub = await this.prisma.publication.findUnique({
      where: { id },
      include: PUBLICATION_INCLUDE,
    });
    if (!pub) throw new NotFoundException('Publication not found');

    if (pub.status !== PublicationStatus.APPROVED) {
      if (!userId) throw new NotFoundException('Publication not found');
      if (role === UserRole.ADMIN) {
        // admins can view any status
      } else if (role === UserRole.DOCTOR) {
        const doctorId = await this.getDoctorProfileId(userId);
        if (pub.doctorId !== doctorId) throw new NotFoundException('Publication not found');
      } else {
        throw new NotFoundException('Publication not found');
      }
    }

    return pub;
  }

  async findBySlug(slug: string, viewerKey?: string, userId?: string) {
    const pub = await this.prisma.publication.findUnique({
      where: { slug },
      include: {
        ...PUBLICATION_INCLUDE,
        _count: { select: { bookmarks: true } },
      },
    });
    if (!pub) throw new NotFoundException('Publication not found');

    const isApproved = pub.status === PublicationStatus.APPROVED;
    const isPublic =
      isApproved &&
      (pub.visibility === PublicationVisibility.PUBLIC ||
        pub.visibility === PublicationVisibility.AFTER_APPROVAL);

    if (!isPublic) {
      if (!userId) throw new NotFoundException('Publication not found');
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.role === UserRole.DOCTOR) {
        const doctorId = await this.getDoctorProfileId(userId);
        if (pub.doctorId !== doctorId) throw new NotFoundException('Publication not found');
      } else if (user?.role !== UserRole.ADMIN) {
        throw new NotFoundException('Publication not found');
      }
    }

    if (viewerKey && isPublic) {
      await this.trackView(pub.id, viewerKey);
    }

    let bookmarked = false;
    if (userId) {
      const bookmark = await this.prisma.publicationBookmark.findUnique({
        where: { publicationId_userId: { publicationId: pub.id, userId } },
      });
      bookmarked = !!bookmark;
    }

    const { _count, ...rest } = pub;
    return { ...rest, bookmarked, bookmarkCount: _count.bookmarks };
  }

  async findRelated(slug: string, limit = 6) {
    const pub = await this.prisma.publication.findUnique({ where: { slug } });
    if (!pub) throw new NotFoundException('Publication not found');
    if (pub.status !== PublicationStatus.APPROVED) {
      throw new NotFoundException('Publication not found');
    }

    const approvedWhere = {
      status: PublicationStatus.APPROVED,
      visibility: { in: [PublicationVisibility.PUBLIC, PublicationVisibility.AFTER_APPROVAL] },
      id: { not: pub.id },
    } satisfies Prisma.PublicationWhereInput;

    const sameDoctor = await this.prisma.publication.findMany({
      where: { ...approvedWhere, doctorId: pub.doctorId },
      take: limit,
      orderBy: { publishedAt: 'desc' },
      include: PUBLICATION_INCLUDE,
    });

    if (sameDoctor.length >= limit) return sameDoctor;

    const remaining = limit - sameDoctor.length;
    const sameSpecialty = await this.prisma.publication.findMany({
      where: {
        ...approvedWhere,
        doctorId: { not: pub.doctorId },
        medicalSpecialty: pub.medicalSpecialty ?? undefined,
      },
      take: remaining,
      orderBy: { viewCount: 'desc' },
      include: PUBLICATION_INCLUDE,
    });

    return [...sameDoctor, ...sameSpecialty];
  }

  async getDoctorPublicationCount(doctorId: string) {
    return this.prisma.publication.count({
      where: {
        doctorId,
        status: PublicationStatus.APPROVED,
        visibility: { in: [PublicationVisibility.PUBLIC, PublicationVisibility.AFTER_APPROVAL] },
      },
    });
  }

  private buildWhere(query: PublicationQueryDto, options?: { approvedOnly?: boolean; doctorId?: string }) {
    const where: Prisma.PublicationWhereInput = {};

    if (options?.approvedOnly) {
      where.status = PublicationStatus.APPROVED;
      where.visibility = { in: [PublicationVisibility.PUBLIC, PublicationVisibility.AFTER_APPROVAL] };
    } else if (query.status) {
      where.status = query.status;
    }

    if (options?.doctorId) where.doctorId = options.doctorId;
    else if (query.doctorId) where.doctorId = query.doctorId;

    if (query.specialty) where.medicalSpecialty = { contains: query.specialty, mode: 'insensitive' };
    if (query.publicationType) where.publicationType = query.publicationType;
    if (query.journal) where.journalName = { contains: query.journal, mode: 'insensitive' };
    if (query.year) {
      where.publicationDate = {
        gte: new Date(`${query.year}-01-01`),
        lt: new Date(`${query.year + 1}-01-01`),
      };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { abstract: { contains: query.search, mode: 'insensitive' } },
        { doi: { contains: query.search, mode: 'insensitive' } },
        { journalName: { contains: query.search, mode: 'insensitive' } },
        { keywords: { some: { keyword: { contains: query.search, mode: 'insensitive' } } } },
        { doctor: { user: { OR: [
          { firstName: { contains: query.search, mode: 'insensitive' } },
          { lastName: { contains: query.search, mode: 'insensitive' } },
        ] } } },
      ];
    }

    return where;
  }

  private buildOrder(sort?: string): Prisma.PublicationOrderByWithRelationInput {
    switch (sort) {
      case 'oldest': return { publishedAt: 'asc' };
      case 'views': return { viewCount: 'desc' };
      case 'downloads': return { downloadCount: 'desc' };
      case 'citations': return { citationCount: 'desc' };
      default: return { publishedAt: 'desc' };
    }
  }

  async findAll(query: PublicationQueryDto, options?: { approvedOnly?: boolean; doctorId?: string }) {
    const page = Math.max(1, +(query.page ?? 1));
    const limit = Math.min(50, Math.max(1, +(query.limit ?? 12)));
    const skip = (page - 1) * limit;
    const where = this.buildWhere(query, options);

    const [data, total] = await Promise.all([
      this.prisma.publication.findMany({
        where,
        skip,
        take: limit,
        orderBy: this.buildOrder(query.sort),
        include: PUBLICATION_INCLUDE,
      }),
      this.prisma.publication.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findMine(userId: string, query: PublicationQueryDto) {
    const doctorId = await this.getDoctorProfileId(userId);
    return this.findAll(query, { doctorId });
  }

  async getDoctorStats(userId: string) {
    const doctorId = await this.getDoctorProfileId(userId);
    const [total, approved, pending, rejected, drafts] = await Promise.all([
      this.prisma.publication.count({ where: { doctorId } }),
      this.prisma.publication.count({ where: { doctorId, status: PublicationStatus.APPROVED } }),
      this.prisma.publication.count({
        where: {
          doctorId,
          status: { in: [PublicationStatus.SUBMITTED, PublicationStatus.UNDER_REVIEW, PublicationStatus.NEEDS_REVISION] },
        },
      }),
      this.prisma.publication.count({ where: { doctorId, status: PublicationStatus.REJECTED } }),
      this.prisma.publication.count({ where: { doctorId, status: PublicationStatus.DRAFT } }),
    ]);
    return { total, approved, pending, rejected, drafts };
  }

  async getAdminStats() {
    const [pending, approved, rejected, total] = await Promise.all([
      this.prisma.publication.count({
        where: { status: { in: [PublicationStatus.SUBMITTED, PublicationStatus.UNDER_REVIEW] } },
      }),
      this.prisma.publication.count({ where: { status: PublicationStatus.APPROVED } }),
      this.prisma.publication.count({ where: { status: PublicationStatus.REJECTED } }),
      this.prisma.publication.count(),
    ]);
    return { pending, approved, rejected, total };
  }

  async getPublicStats() {
    const approvedWhere = {
      status: PublicationStatus.APPROVED,
      visibility: { in: [PublicationVisibility.PUBLIC, PublicationVisibility.AFTER_APPROVAL] },
    };
    const [publicationCount, doctorCount, specialtyGroups] = await Promise.all([
      this.prisma.publication.count({ where: approvedWhere }),
      this.prisma.publication.groupBy({
        by: ['doctorId'],
        where: approvedWhere,
      }),
      this.prisma.publication.groupBy({
        by: ['medicalSpecialty'],
        where: { ...approvedWhere, medicalSpecialty: { not: null } },
      }),
    ]);
    return {
      publicationCount,
      doctorCount: doctorCount.length,
      specialtyCount: specialtyGroups.length,
      sourcesCitedPercent: 100,
    };
  }

  async findFeatured(limit = 5) {
    return this.prisma.publication.findMany({
      where: {
        status: PublicationStatus.APPROVED,
        featured: true,
        visibility: { in: [PublicationVisibility.PUBLIC, PublicationVisibility.AFTER_APPROVAL] },
      },
      orderBy: [{ pinned: 'desc' }, { featuredOrder: 'asc' }, { publishedAt: 'desc' }],
      take: limit,
      include: PUBLICATION_INCLUDE,
    });
  }

  async findPopular(limit = 5) {
    return this.prisma.publication.findMany({
      where: {
        status: PublicationStatus.APPROVED,
        visibility: { in: [PublicationVisibility.PUBLIC, PublicationVisibility.AFTER_APPROVAL] },
      },
      orderBy: { viewCount: 'desc' },
      take: limit,
      include: PUBLICATION_INCLUDE,
    });
  }

  async findLatest(limit = 10) {
    return this.prisma.publication.findMany({
      where: {
        status: PublicationStatus.APPROVED,
        visibility: { in: [PublicationVisibility.PUBLIC, PublicationVisibility.AFTER_APPROVAL] },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      include: PUBLICATION_INCLUDE,
    });
  }

  async findByDoctorPublic(doctorId: string, limit = 10) {
    return this.prisma.publication.findMany({
      where: {
        doctorId,
        status: PublicationStatus.APPROVED,
        visibility: { in: [PublicationVisibility.PUBLIC, PublicationVisibility.AFTER_APPROVAL] },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      include: PUBLICATION_INCLUDE,
    });
  }

  async review(id: string, reviewerId: string, dto: ReviewPublicationDto) {
    const pub = await this.prisma.publication.findUnique({
      where: { id },
      include: { doctor: true },
    });
    if (!pub) throw new NotFoundException('Publication not found');

    const updateData: Prisma.PublicationUpdateInput = {};

    if (dto.assignedReviewerId) {
      updateData.assignedReviewer = { connect: { id: dto.assignedReviewerId } };
      updateData.status = PublicationStatus.UNDER_REVIEW;
    }

    if (dto.action === PublicationReviewAction.ASSIGN_REVIEWER) {
      // assignment only — status set above
    } else if (dto.action === PublicationReviewAction.APPROVE) {
      updateData.status = PublicationStatus.APPROVED;
      updateData.approvedAt = new Date();
      updateData.publishedAt = new Date();
      updateData.rejectedAt = null;
      if (dto.visibility) updateData.visibility = dto.visibility;
      if (dto.featured !== undefined) updateData.featured = dto.featured;
      if (dto.pinned !== undefined) updateData.pinned = dto.pinned;
      if (dto.reviewingPhysician !== undefined) updateData.reviewingPhysician = dto.reviewingPhysician;
      if (dto.lastReviewedDate) updateData.lastReviewedDate = new Date(dto.lastReviewedDate);
      if (dto.peerReviewOutcome !== undefined) updateData.peerReviewOutcome = dto.peerReviewOutcome;
      if (dto.nextScheduledReview) updateData.nextScheduledReview = new Date(dto.nextScheduledReview);
      if (dto.evidenceGrade !== undefined) updateData.evidenceGrade = dto.evidenceGrade;
      if (dto.openAccess !== undefined) updateData.openAccess = dto.openAccess;
      if (dto.physicianReviewed !== undefined) updateData.physicianReviewed = dto.physicianReviewed;
    } else if (dto.action === PublicationReviewAction.REJECT) {
      updateData.status = PublicationStatus.REJECTED;
      updateData.rejectedAt = new Date();
    } else if (dto.action === PublicationReviewAction.REQUEST_REVISION) {
      updateData.status = PublicationStatus.NEEDS_REVISION;
    }

    await this.prisma.publication.update({ where: { id }, data: updateData });

    await this.prisma.publicationReview.create({
      data: {
        publicationId: id,
        reviewerId,
        action: dto.action,
        internalNotes: dto.internalNotes,
        feedback: dto.feedback,
        visibility: dto.visibility,
        featured: dto.featured,
        pinned: dto.pinned,
      },
    });

    if (dto.action === PublicationReviewAction.REQUEST_REVISION && dto.feedback) {
      await this.prisma.publicationRevision.create({
        data: { publicationId: id, revisionNotes: dto.feedback },
      });
    }

    const newStatus =
      dto.action === PublicationReviewAction.APPROVE
        ? PublicationStatus.APPROVED
        : dto.action === PublicationReviewAction.REJECT
          ? PublicationStatus.REJECTED
          : dto.action === PublicationReviewAction.REQUEST_REVISION
            ? PublicationStatus.NEEDS_REVISION
            : dto.action === PublicationReviewAction.ASSIGN_REVIEWER
              ? PublicationStatus.UNDER_REVIEW
              : PublicationStatus.UNDER_REVIEW;

    if (dto.action !== PublicationReviewAction.ASSIGN_REVIEWER || dto.feedback) {
      await this.notifyDoctorStatus(pub.doctor.userId, pub, newStatus, dto.feedback);
    }

    if (dto.assignedReviewerId && dto.action === PublicationReviewAction.ASSIGN_REVIEWER) {
      await this.notifications.create(dto.assignedReviewerId, {
        type: NotificationType.PUBLICATION,
        title: 'Publication assigned for review',
        body: `"${pub.title}" has been assigned to you for medical review.`,
      });
    }

    return this.findById(id, reviewerId, UserRole.ADMIN);
  }

  async updateAdminFlags(id: string, flags: { featured?: boolean; pinned?: boolean }) {
    return this.prisma.publication.update({
      where: { id },
      data: {
        ...(flags.featured !== undefined && { featured: flags.featured }),
        ...(flags.pinned !== undefined && { pinned: flags.pinned }),
      },
      include: PUBLICATION_INCLUDE,
    });
  }

  async trackView(publicationId: string, viewerKey: string) {
    const recent = await this.prisma.publicationView.findFirst({
      where: {
        publicationId,
        viewerKey,
        createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) },
      },
    });
    if (recent) return;
    await this.prisma.$transaction([
      this.prisma.publicationView.create({ data: { publicationId, viewerKey } }),
      this.prisma.publication.update({
        where: { id: publicationId },
        data: { viewCount: { increment: 1 } },
      }),
    ]);
  }

  async trackDownload(publicationId: string, downloaderKey: string) {
    await this.prisma.$transaction([
      this.prisma.publicationDownload.create({ data: { publicationId, downloaderKey } }),
      this.prisma.publication.update({
        where: { id: publicationId },
        data: { downloadCount: { increment: 1 } },
      }),
    ]);
    return { success: true };
  }

  async trackShare(publicationId: string) {
    await this.prisma.publication.update({
      where: { id: publicationId },
      data: { shareCount: { increment: 1 } },
    });
    return { success: true };
  }

  async trackCitation(publicationId: string, citedByKey: string) {
    await this.prisma.$transaction([
      this.prisma.publicationCitation.create({ data: { publicationId, citedByKey } }),
      this.prisma.publication.update({
        where: { id: publicationId },
        data: { citationCount: { increment: 1 } },
      }),
    ]);
    return { success: true };
  }

  async toggleBookmark(publicationId: string, userId: string) {
    const existing = await this.prisma.publicationBookmark.findUnique({
      where: { publicationId_userId: { publicationId, userId } },
    });
    if (existing) {
      await this.prisma.publicationBookmark.delete({ where: { id: existing.id } });
      return { bookmarked: false };
    }
    await this.prisma.publicationBookmark.create({ data: { publicationId, userId } });
    return { bookmarked: true };
  }

  async getSpecialties() {
    const rows = await this.prisma.publication.groupBy({
      by: ['medicalSpecialty'],
      where: {
        status: PublicationStatus.APPROVED,
        medicalSpecialty: { not: null },
      },
      _count: true,
    });
    return rows
      .filter((r) => r.medicalSpecialty)
      .map((r) => ({ specialty: r.medicalSpecialty!, count: r._count }))
      .sort((a, b) => b.count - a.count);
  }
}
