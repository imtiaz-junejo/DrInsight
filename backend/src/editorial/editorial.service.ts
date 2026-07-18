import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ArticleReviewAction,
  AuditCategory,
  BlogStatus,
  EditorialDocumentStatus,
  EditorialReviewStageType,
  EditorialStageStatus,
  NotificationType,
  Prisma,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import type { ArticleReviewActionDto, ArticleReviewQueryDto, BulkArticleReviewDto } from './dto/article-review.dto';
import type {
  AuthorGuidelineQueryDto,
  EditorialPolicyQueryDto,
  MedicalReviewStageActionDto,
  UpsertAuthorGuidelineDto,
  UpsertEditorialPolicyDto,
} from './dto/editorial-policy.dto';

const REVIEW_QUEUE_STATUSES: BlogStatus[] = [
  BlogStatus.SUBMITTED,
  BlogStatus.UNDER_MEDICAL_REVIEW,
  BlogStatus.NEEDS_REVISION,
  BlogStatus.APPROVED,
];

const STAGE_ORDER: EditorialReviewStageType[] = [
  EditorialReviewStageType.SUBMITTED,
  EditorialReviewStageType.EDITORIAL_SCREENING,
  EditorialReviewStageType.MEDICAL_REVIEW,
  EditorialReviewStageType.REVISION_REQUESTED,
  EditorialReviewStageType.FINAL_EDITORIAL_REVIEW,
  EditorialReviewStageType.APPROVED,
  EditorialReviewStageType.PUBLISHED,
];

const postInclude = {
  author: { select: { id: true, firstName: true, lastName: true, email: true } },
  category: { select: { id: true, name: true, slug: true } },
  reviewer: { select: { id: true, firstName: true, lastName: true } },
  editorialReview: {
    include: {
      stages: {
        orderBy: { displayOrder: 'asc' as const },
        include: { reviewer: { select: { id: true, firstName: true, lastName: true } } },
      },
    },
  },
} satisfies Prisma.BlogPostInclude;

@Injectable()
export class EditorialService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private auditLog: AuditLogService,
  ) {}

  private slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 80);
  }

  private async uniqueSlug(base: string, model: 'policy' | 'guideline', excludeId?: string) {
    let slug = this.slugify(base);
    let suffix = 0;
    while (true) {
      const candidate = suffix ? `${slug}-${suffix}` : slug;
      const exists =
        model === 'policy'
          ? await this.prisma.editorialPolicy.findFirst({ where: { slug: candidate, ...(excludeId && { NOT: { id: excludeId } }) } })
          : await this.prisma.authorGuideline.findFirst({ where: { slug: candidate, ...(excludeId && { NOT: { id: excludeId } }) } });
      if (!exists) return candidate;
      suffix += 1;
    }
  }

  private bumpVersion(current?: string | null) {
    const parts = (current ?? '1.0').split('.').map((p) => parseInt(p, 10) || 0);
    parts[parts.length - 1] += 1;
    return parts.join('.');
  }

  async getArticleReviewStats() {
    const [pending, underMedicalReview, approved, rejected, needsRevision, published] =
      await Promise.all([
        this.prisma.blogPost.count({ where: { status: BlogStatus.SUBMITTED } }),
        this.prisma.blogPost.count({ where: { status: BlogStatus.UNDER_MEDICAL_REVIEW } }),
        this.prisma.blogPost.count({ where: { status: BlogStatus.APPROVED } }),
        this.prisma.blogPost.count({ where: { status: BlogStatus.REJECTED } }),
        this.prisma.blogPost.count({ where: { status: BlogStatus.NEEDS_REVISION } }),
        this.prisma.blogPost.count({ where: { status: BlogStatus.PUBLISHED } }),
      ]);
    return { pending, underMedicalReview, approved, rejected, needsRevision, published };
  }

  async listArticleReviewQueue(query: ArticleReviewQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.BlogPostWhereInput = {
      ...(query.status
        ? { status: query.status }
        : { status: { in: [...REVIEW_QUEUE_STATUSES, BlogStatus.REJECTED, BlogStatus.PUBLISHED, BlogStatus.DRAFT] } }),
      ...(query.priority && { reviewPriority: query.priority }),
      ...(query.reviewerId && { reviewerId: query.reviewerId }),
      ...(query.category && { category: { slug: query.category } }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { author: { firstName: { contains: query.search, mode: 'insensitive' } } },
          { author: { lastName: { contains: query.search, mode: 'insensitive' } } },
        ],
      }),
    };

    const orderBy: Prisma.BlogPostOrderByWithRelationInput[] =
      query.sort === 'oldest'
        ? [{ submittedAt: 'asc' }, { createdAt: 'asc' }]
        : query.sort === 'priority'
          ? [{ reviewPriority: 'desc' }, { submittedAt: 'asc' }]
          : query.sort === 'title'
            ? [{ title: 'asc' }]
            : query.sort === 'updated'
              ? [{ updatedAt: 'desc' }]
              : [{ submittedAt: 'desc' }, { createdAt: 'desc' }];

    const [data, total] = await Promise.all([
      this.prisma.blogPost.findMany({ where, skip, take: limit, orderBy, include: postInclude }),
      this.prisma.blogPost.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getArticleReviewHistory(postId: string) {
    return this.prisma.articleReviewHistory.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
      include: { actor: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  private async ensureEditorialReview(postId: string) {
    let review = await this.prisma.editorialReview.findUnique({
      where: { postId },
      include: { stages: true },
    });
    if (review) return review;

    review = await this.prisma.editorialReview.create({
      data: {
        postId,
        currentStage: EditorialReviewStageType.SUBMITTED,
        stages: {
          create: STAGE_ORDER.map((stage, index) => ({
            stage,
            displayOrder: index,
            status:
              stage === EditorialReviewStageType.SUBMITTED
                ? EditorialStageStatus.IN_PROGRESS
                : EditorialStageStatus.PENDING,
          })),
        },
      },
      include: { stages: true },
    });
    return review;
  }

  private async logArticleAction(
    postId: string,
    actorId: string,
    action: ArticleReviewAction,
    fromStatus?: BlogStatus,
    toStatus?: BlogStatus,
    notes?: string,
    internalNotes?: string,
  ) {
    return this.prisma.articleReviewHistory.create({
      data: { postId, actorId, action, fromStatus, toStatus, notes, internalNotes },
    });
  }

  private async notifyAuthor(authorId: string, title: string, body: string, data?: Record<string, unknown>) {
    await this.notifications.create(authorId, {
      type: NotificationType.REVIEW,
      title,
      body,
      data,
    });
  }

  private async notifyReviewer(reviewerId: string, title: string, body: string) {
    await this.notifications.create(reviewerId, {
      type: NotificationType.REVIEW,
      title,
      body,
    });
  }

  async performArticleAction(postId: string, actorId: string, actorRole: UserRole, dto: ArticleReviewActionDto) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id: postId },
      include: { author: true, reviewer: true },
    });
    if (!post) throw new NotFoundException('Article not found');

    if (actorRole === UserRole.DOCTOR && post.reviewerId !== actorId) {
      throw new ForbiddenException('You can only review assigned articles');
    }

    const fromStatus = post.status;
    let toStatus = post.status;
    const updateData: Prisma.BlogPostUpdateInput = {};

    switch (dto.action) {
      case ArticleReviewAction.ASSIGN_REVIEWER:
      case ArticleReviewAction.REASSIGN_REVIEWER:
        if (!dto.reviewerId) throw new BadRequestException('reviewerId is required');
        updateData.reviewer = { connect: { id: dto.reviewerId } };
        toStatus = BlogStatus.UNDER_MEDICAL_REVIEW;
        updateData.status = toStatus;
        if (!post.submittedAt) updateData.submittedAt = new Date();
        await this.ensureEditorialReview(postId);
        await this.notifyReviewer(dto.reviewerId, 'Article assigned for review', `"${post.title}" has been assigned to you.`);
        break;
      case ArticleReviewAction.APPROVE:
        toStatus = BlogStatus.APPROVED;
        updateData.status = toStatus;
        updateData.approvedAt = new Date();
        updateData.peerReviewed = true;
        updateData.lastReviewedAt = new Date();
        await this.notifyAuthor(post.authorId, 'Article approved', `"${post.title}" has been approved.`);
        break;
      case ArticleReviewAction.REJECT:
        toStatus = BlogStatus.REJECTED;
        updateData.status = toStatus;
        updateData.rejectedAt = new Date();
        if (dto.notes) updateData.revisionNotes = dto.notes;
        await this.notifyAuthor(post.authorId, 'Article rejected', dto.notes ?? `"${post.title}" was rejected.`);
        break;
      case ArticleReviewAction.REQUEST_REVISION:
        toStatus = BlogStatus.NEEDS_REVISION;
        updateData.status = toStatus;
        if (dto.notes) updateData.revisionNotes = dto.notes;
        await this.notifyAuthor(post.authorId, 'Revision requested', dto.notes ?? `Revisions needed for "${post.title}".`);
        break;
      case ArticleReviewAction.PUBLISH:
        toStatus = BlogStatus.PUBLISHED;
        updateData.status = toStatus;
        updateData.publishedAt = new Date();
        await this.notifyAuthor(post.authorId, 'Article published', `"${post.title}" is now live.`);
        break;
      case ArticleReviewAction.UNPUBLISH:
        toStatus = BlogStatus.APPROVED;
        updateData.status = toStatus;
        updateData.publishedAt = null;
        break;
      case ArticleReviewAction.ARCHIVE:
        toStatus = BlogStatus.ARCHIVED;
        updateData.status = toStatus;
        break;
      case ArticleReviewAction.FEATURE:
        updateData.featured = true;
        break;
      case ArticleReviewAction.UNFEATURE:
        updateData.featured = false;
        break;
      case ArticleReviewAction.PIN:
        updateData.pinned = true;
        break;
      case ArticleReviewAction.UNPIN:
        updateData.pinned = false;
        break;
      case ArticleReviewAction.DELETE:
        await this.logArticleAction(postId, actorId, dto.action, fromStatus, toStatus, dto.notes, dto.internalNotes);
        await this.prisma.blogPost.delete({ where: { id: postId } });
        return { success: true, deleted: true };
      default:
        break;
    }

    if (dto.priority) updateData.reviewPriority = dto.priority;
    if (dto.featured !== undefined) updateData.featured = dto.featured;
    if (dto.pinned !== undefined) updateData.pinned = dto.pinned;

    const updated = await this.prisma.blogPost.update({
      where: { id: postId },
      data: updateData,
      include: postInclude,
    });

    await this.logArticleAction(postId, actorId, dto.action, fromStatus, toStatus, dto.notes, dto.internalNotes);

    return updated;
  }

  async bulkArticleAction(actorId: string, dto: BulkArticleReviewDto) {
    const results = [];
    for (const postId of dto.postIds) {
      results.push(
        await this.performArticleAction(postId, actorId, UserRole.ADMIN, {
          action: dto.action,
          reviewerId: dto.reviewerId,
          notes: dto.notes,
        }),
      );
    }
    return { count: results.length, results };
  }

  async listMedicalReviewers() {
    const reviewers = await this.prisma.medicalReviewer.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            doctorProfile: { select: { specialty: true, experienceYears: true, editorialBoard: true } },
          },
        },
      },
      orderBy: [{ tier: 'asc' }, { createdAt: 'asc' }],
    });

    if (reviewers.length === 0) {
      const doctors = await this.prisma.user.findMany({
        where: {
          role: UserRole.DOCTOR,
          status: 'ACTIVE',
          OR: [{ doctorProfile: { editorialBoard: true } }, { reviewedBlogPosts: { some: {} } }],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          doctorProfile: { select: { specialty: true, experienceYears: true, editorialBoard: true } },
        },
        take: 50,
      });
      return doctors.map((d) => ({
        id: d.id,
        userId: d.id,
        tier: d.doctorProfile?.experienceYears && d.doctorProfile.experienceYears >= 7 ? 2 : 1,
        specialty: d.doctorProfile?.specialty,
        isActive: true,
        user: d,
      }));
    }

    return reviewers;
  }

  async getMedicalReview(postId?: string, publicationId?: string) {
    const where = postId ? { postId } : publicationId ? { publicationId } : null;
    if (!where) throw new BadRequestException('postId or publicationId required');

    let review = await this.prisma.editorialReview.findFirst({
      where,
      include: {
        stages: {
          orderBy: { displayOrder: 'asc' },
          include: { reviewer: { select: { id: true, firstName: true, lastName: true } } },
        },
        post: { select: { id: true, title: true, slug: true, status: true } },
        publication: { select: { id: true, title: true, slug: true, status: true } },
      },
    });

    if (!review && postId) {
      await this.ensureEditorialReview(postId);
      review = await this.prisma.editorialReview.findFirst({
        where: { postId },
        include: {
          stages: {
            orderBy: { displayOrder: 'asc' },
            include: { reviewer: { select: { id: true, firstName: true, lastName: true } } },
          },
          post: { select: { id: true, title: true, slug: true, status: true } },
          publication: { select: { id: true, title: true, slug: true, status: true } },
        },
      });
    }

    if (!review) throw new NotFoundException('Medical review not found');
    return review;
  }

  async ensurePublicationReview(publicationId: string) {
    let review = await this.prisma.editorialReview.findUnique({ where: { publicationId } });
    if (review) return review;
    return this.prisma.editorialReview.create({
      data: {
        publicationId,
        currentStage: EditorialReviewStageType.SUBMITTED,
        stages: {
          create: STAGE_ORDER.map((stage, index) => ({
            stage,
            displayOrder: index,
            status:
              stage === EditorialReviewStageType.SUBMITTED
                ? EditorialStageStatus.IN_PROGRESS
                : EditorialStageStatus.PENDING,
          })),
        },
      },
    });
  }

  async updateMedicalReviewStage(
    reviewId: string,
    stageType: EditorialReviewStageType,
    actorId: string,
    dto: MedicalReviewStageActionDto,
    action: 'assign' | 'complete' | 'request_changes' | 'approve' | 'reject' | 'notes',
  ) {
    const review = await this.prisma.editorialReview.findUnique({
      where: { id: reviewId },
      include: {
        post: { include: { author: true } },
        publication: { include: { doctor: { include: { user: true } } } },
        stages: true,
      },
    });
    if (!review) throw new NotFoundException('Review not found');

    const stage = review.stages.find((s) => s.stage === stageType);
    if (!stage) throw new NotFoundException('Stage not found');

    const stageUpdate: Prisma.EditorialReviewStageUpdateInput = {
      ...(dto.reviewerId && { reviewer: { connect: { id: dto.reviewerId } } }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
      ...(dto.medicalNotes !== undefined && { medicalNotes: dto.medicalNotes }),
      ...(dto.internalNotes !== undefined && { internalNotes: dto.internalNotes }),
      ...(dto.dueDate && { dueDate: new Date(dto.dueDate) }),
    };

    if (action === 'assign' && dto.reviewerId) {
      stageUpdate.status = EditorialStageStatus.IN_PROGRESS;
      await this.notifyReviewer(dto.reviewerId, 'Review stage assigned', `You have been assigned to ${stageType.replace(/_/g, ' ').toLowerCase()}.`);
    }
    if (action === 'complete') {
      stageUpdate.status = EditorialStageStatus.COMPLETED;
      stageUpdate.completedAt = new Date();
      stageUpdate.reviewDate = new Date();
    }
    if (action === 'request_changes') {
      stageUpdate.status = EditorialStageStatus.REJECTED;
      if (review.post) {
        await this.prisma.blogPost.update({
          where: { id: review.post.id },
          data: { status: BlogStatus.NEEDS_REVISION, revisionNotes: dto.notes },
        });
        await this.notifyAuthor(review.post.authorId, 'Changes requested', dto.notes ?? 'Please revise your article.');
      }
    }
    if (action === 'approve') {
      stageUpdate.status = EditorialStageStatus.COMPLETED;
      stageUpdate.completedAt = new Date();
    }
    if (action === 'reject') {
      stageUpdate.status = EditorialStageStatus.REJECTED;
    }

    await this.prisma.editorialReviewStage.update({ where: { id: stage.id }, data: stageUpdate });

    let nextStage = review.currentStage;
    if (action === 'complete' || action === 'approve') {
      const idx = STAGE_ORDER.indexOf(stageType);
      if (idx >= 0 && idx < STAGE_ORDER.length - 1) {
        nextStage = STAGE_ORDER[idx + 1];
        const next = review.stages.find((s) => s.stage === nextStage);
        if (next) {
          await this.prisma.editorialReviewStage.update({
            where: { id: next.id },
            data: { status: EditorialStageStatus.IN_PROGRESS },
          });
        }
      }
    }

    return this.prisma.editorialReview.update({
      where: { id: reviewId },
      data: { currentStage: nextStage },
      include: {
        stages: {
          orderBy: { displayOrder: 'asc' },
          include: { reviewer: { select: { id: true, firstName: true, lastName: true } } },
        },
        post: { select: { id: true, title: true, slug: true, status: true } },
        publication: { select: { id: true, title: true, slug: true, status: true } },
      },
    });
  }

  // ─── Editorial Policies ───────────────────────────────────────────────────

  async listEditorialPolicies(query: EditorialPolicyQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    const where: Prisma.EditorialPolicyWhereInput = {
      ...(query.category && { category: query.category }),
      ...(query.status && { status: query.status }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { slug: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };
    const orderBy: Prisma.EditorialPolicyOrderByWithRelationInput =
      query.sort === 'oldest' ? { updatedAt: 'asc' } : query.sort === 'title' ? { title: 'asc' } : query.sort === 'version' ? { version: 'desc' } : { updatedAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.editorialPolicy.findMany({ where, skip, take: limit, orderBy }),
      this.prisma.editorialPolicy.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getEditorialPolicy(id: string) {
    const policy = await this.prisma.editorialPolicy.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          include: { createdBy: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
    });
    if (!policy) throw new NotFoundException('Policy not found');
    return policy;
  }

  async createEditorialPolicy(actorId: string, dto: UpsertEditorialPolicyDto) {
    const slug = await this.uniqueSlug(dto.slug ?? dto.title, 'policy');
    const version = dto.version ?? '1.0';
    const policy = await this.prisma.editorialPolicy.create({
      data: {
        title: dto.title,
        slug,
        category: dto.category,
        version,
        effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : null,
        status: dto.status ?? EditorialDocumentStatus.DRAFT,
        contentHtml: dto.contentHtml,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        metaKeywords: dto.metaKeywords ?? [],
        versions: {
          create: {
            versionNumber: version,
            title: dto.title,
            contentHtml: dto.contentHtml,
            changeLog: dto.changeLog ?? 'Initial version',
            seoTitle: dto.seoTitle,
            seoDescription: dto.seoDescription,
            metaKeywords: dto.metaKeywords ?? [],
            isCurrent: true,
            createdById: actorId,
          },
        },
      },
      include: { versions: true },
    });
    await this.auditLog.log({
      actorUserId: actorId,
      actorName: 'Admin',
      action: 'Created editorial policy',
      target: policy.title,
      category: AuditCategory.ADMIN,
    });
    return policy;
  }

  async updateEditorialPolicy(id: string, actorId: string, dto: UpsertEditorialPolicyDto) {
    const existing = await this.getEditorialPolicy(id);
    const newVersion = this.bumpVersion(existing.version);
    const policy = await this.prisma.$transaction(async (tx) => {
      await tx.editorialPolicyVersion.updateMany({
        where: { policyId: id },
        data: { isCurrent: false },
      });
      await tx.editorialPolicyVersion.create({
        data: {
          policyId: id,
          versionNumber: newVersion,
          title: dto.title,
          contentHtml: dto.contentHtml,
          changeLog: dto.changeLog ?? `Updated to v${newVersion}`,
          seoTitle: dto.seoTitle,
          seoDescription: dto.seoDescription,
          metaKeywords: dto.metaKeywords ?? [],
          isCurrent: true,
          createdById: actorId,
        },
      });
      return tx.editorialPolicy.update({
        where: { id },
        data: {
          title: dto.title,
          category: dto.category,
          version: newVersion,
          effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : undefined,
          status: dto.status,
          contentHtml: dto.contentHtml,
          seoTitle: dto.seoTitle,
          seoDescription: dto.seoDescription,
          metaKeywords: dto.metaKeywords,
        },
        include: {
          versions: {
            orderBy: { createdAt: 'desc' },
            include: { createdBy: { select: { id: true, firstName: true, lastName: true } } },
          },
        },
      });
    });

    const admins = await this.prisma.user.findMany({ where: { role: UserRole.ADMIN, status: 'ACTIVE' }, select: { id: true } });
    await Promise.all(
      admins.map((a) =>
        this.notifications.create(a.id, {
          type: NotificationType.SYSTEM,
          title: 'Editorial policy updated',
          body: `"${policy.title}" was updated to v${newVersion}.`,
        }),
      ),
    );
    return policy;
  }

  async publishEditorialPolicy(id: string, actorId: string) {
    const policy = await this.prisma.editorialPolicy.update({
      where: { id },
      data: { status: EditorialDocumentStatus.PUBLISHED, isCurrent: true },
    });
    await this.auditLog.log({ actorUserId: actorId, actorName: 'Admin', action: 'Published editorial policy', target: policy.title, category: AuditCategory.ADMIN });
    return policy;
  }

  async archiveEditorialPolicy(id: string) {
    return this.prisma.editorialPolicy.update({
      where: { id },
      data: { status: EditorialDocumentStatus.ARCHIVED, isCurrent: false },
    });
  }

  async duplicateEditorialPolicy(id: string, actorId: string) {
    const source = await this.getEditorialPolicy(id);
    return this.createEditorialPolicy(actorId, {
      title: `${source.title} (Copy)`,
      category: source.category,
      contentHtml: source.contentHtml ?? undefined,
      seoTitle: source.seoTitle ?? undefined,
      seoDescription: source.seoDescription ?? undefined,
      metaKeywords: source.metaKeywords,
      changeLog: `Duplicated from ${source.title} v${source.version}`,
    });
  }

  async deleteEditorialPolicy(id: string) {
    return this.prisma.editorialPolicy.delete({ where: { id } });
  }

  async rollbackEditorialPolicy(policyId: string, versionId: string, actorId: string) {
    const version = await this.prisma.editorialPolicyVersion.findFirst({
      where: { id: versionId, policyId },
    });
    if (!version) throw new NotFoundException('Version not found');
    const newVersion = this.bumpVersion((await this.prisma.editorialPolicy.findUnique({ where: { id: policyId } }))?.version);
    return this.updateEditorialPolicy(policyId, actorId, {
      title: version.title,
      category: (await this.prisma.editorialPolicy.findUnique({ where: { id: policyId } }))!.category,
      contentHtml: version.contentHtml ?? undefined,
      seoTitle: version.seoTitle ?? undefined,
      seoDescription: version.seoDescription ?? undefined,
      metaKeywords: version.metaKeywords,
      changeLog: `Rolled back from v${version.versionNumber} to new v${newVersion}`,
    });
  }

  // ─── Author Guidelines ──────────────────────────────────────────────────

  async listAuthorGuidelines(query: AuthorGuidelineQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    const where: Prisma.AuthorGuidelineWhereInput = {
      ...(query.category && { category: query.category }),
      ...(query.status && { status: query.status }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { slug: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };
    const orderBy: Prisma.AuthorGuidelineOrderByWithRelationInput =
      query.sort === 'oldest' ? { updatedAt: 'asc' } : query.sort === 'title' ? { title: 'asc' } : query.sort === 'version' ? { version: 'desc' } : { updatedAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.authorGuideline.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { _count: { select: { attachments: true, versions: true } } },
      }),
      this.prisma.authorGuideline.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getAuthorGuideline(id: string) {
    const guideline = await this.prisma.authorGuideline.findUnique({
      where: { id },
      include: {
        attachments: true,
        versions: {
          orderBy: { createdAt: 'desc' },
          include: { createdBy: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
    });
    if (!guideline) throw new NotFoundException('Guideline not found');
    return guideline;
  }

  async createAuthorGuideline(actorId: string, dto: UpsertAuthorGuidelineDto) {
    const slug = await this.uniqueSlug(dto.slug ?? dto.title, 'guideline');
    const version = dto.version ?? '1.0';
    return this.prisma.authorGuideline.create({
      data: {
        title: dto.title,
        slug,
        category: dto.category,
        version,
        status: dto.status ?? EditorialDocumentStatus.DRAFT,
        contentHtml: dto.contentHtml,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        metaKeywords: dto.metaKeywords ?? [],
        versions: {
          create: {
            versionNumber: version,
            title: dto.title,
            contentHtml: dto.contentHtml,
            changeLog: dto.changeLog ?? 'Initial version',
            seoTitle: dto.seoTitle,
            seoDescription: dto.seoDescription,
            metaKeywords: dto.metaKeywords ?? [],
            isCurrent: true,
            createdById: actorId,
          },
        },
      },
      include: { versions: true, attachments: true },
    });
  }

  async updateAuthorGuideline(id: string, actorId: string, dto: UpsertAuthorGuidelineDto) {
    const existing = await this.getAuthorGuideline(id);
    const newVersion = this.bumpVersion(existing.version);
    const guideline = await this.prisma.$transaction(async (tx) => {
      await tx.authorGuidelineVersion.updateMany({ where: { guidelineId: id }, data: { isCurrent: false } });
      await tx.authorGuidelineVersion.create({
        data: {
          guidelineId: id,
          versionNumber: newVersion,
          title: dto.title,
          contentHtml: dto.contentHtml,
          changeLog: dto.changeLog ?? `Updated to v${newVersion}`,
          seoTitle: dto.seoTitle,
          seoDescription: dto.seoDescription,
          metaKeywords: dto.metaKeywords ?? [],
          isCurrent: true,
          createdById: actorId,
        },
      });
      return tx.authorGuideline.update({
        where: { id },
        data: {
          title: dto.title,
          category: dto.category,
          version: newVersion,
          status: dto.status,
          contentHtml: dto.contentHtml,
          seoTitle: dto.seoTitle,
          seoDescription: dto.seoDescription,
          metaKeywords: dto.metaKeywords,
        },
        include: {
          attachments: true,
          versions: {
            orderBy: { createdAt: 'desc' },
            include: { createdBy: { select: { id: true, firstName: true, lastName: true } } },
          },
        },
      });
    });

    const admins = await this.prisma.user.findMany({ where: { role: UserRole.ADMIN, status: 'ACTIVE' }, select: { id: true } });
    await Promise.all(
      admins.map((a) =>
        this.notifications.create(a.id, {
          type: NotificationType.SYSTEM,
          title: 'Author guidelines updated',
          body: `"${guideline.title}" was updated to v${newVersion}.`,
        }),
      ),
    );
    return guideline;
  }

  async publishAuthorGuideline(id: string) {
    return this.prisma.authorGuideline.update({
      where: { id },
      data: { status: EditorialDocumentStatus.PUBLISHED, isCurrent: true },
    });
  }

  async archiveAuthorGuideline(id: string) {
    return this.prisma.authorGuideline.update({
      where: { id },
      data: { status: EditorialDocumentStatus.ARCHIVED, isCurrent: false },
    });
  }

  async duplicateAuthorGuideline(id: string, actorId: string) {
    const source = await this.getAuthorGuideline(id);
    return this.createAuthorGuideline(actorId, {
      title: `${source.title} (Copy)`,
      category: source.category,
      contentHtml: source.contentHtml ?? undefined,
      seoTitle: source.seoTitle ?? undefined,
      seoDescription: source.seoDescription ?? undefined,
      metaKeywords: source.metaKeywords,
      changeLog: `Duplicated from ${source.title} v${source.version}`,
    });
  }

  async deleteAuthorGuideline(id: string) {
    return this.prisma.authorGuideline.delete({ where: { id } });
  }

  async addGuidelineAttachment(guidelineId: string, file: { fileName: string; fileUrl: string; fileSize?: number; mimeType?: string }) {
    return this.prisma.authorGuidelineAttachment.create({
      data: { guidelineId, ...file },
    });
  }

  async rollbackAuthorGuideline(guidelineId: string, versionId: string, actorId: string) {
    const version = await this.prisma.authorGuidelineVersion.findFirst({
      where: { id: versionId, guidelineId },
    });
    if (!version) throw new NotFoundException('Version not found');
    const parent = await this.prisma.authorGuideline.findUnique({ where: { id: guidelineId } });
    return this.updateAuthorGuideline(guidelineId, actorId, {
      title: version.title,
      category: parent!.category,
      contentHtml: version.contentHtml ?? undefined,
      seoTitle: version.seoTitle ?? undefined,
      seoDescription: version.seoDescription ?? undefined,
      metaKeywords: version.metaKeywords,
      changeLog: `Rolled back from v${version.versionNumber}`,
    });
  }
}
