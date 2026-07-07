import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BlogCommentStatus, BlogStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { interleavePostsByCategory, orderCategorySlugs } from './blog-mixed-order';
import {
  CreateBlogPostDto,
  SubmitBlogCommentDto,
  SubmitBlogFeedbackDto,
  UpdateBlogPostDto,
} from './dto/blog-post.dto';

const authorSelect = {
  id: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  role: true,
  doctorProfile: {
    select: {
      specialty: true,
      subSpecialty: true,
      hospital: true,
      credentials: true,
      professionalTitle: true,
      experienceYears: true,
      bio: true,
      platformRole: true,
      editorialBoard: true,
    },
  },
} as const;

const postInclude = {
  category: true,
  author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
} as const;

const postCardInclude = {
  category: true,
  author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
} as const;

function estimateReadTime(content: string): number {
  const text = content.replace(/<[^>]+>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    status?: BlogStatus | 'ALL';
    authorId?: string;
    sort?: 'recent' | 'popular' | 'mixed';
  }) {
    const useMixed = query.sort === 'mixed' && !query.category && !query.search;

    if (useMixed) {
      return this.findAllMixed(query);
    }

    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;

    const where: Prisma.BlogPostWhereInput = {
      ...(query.status && query.status !== 'ALL' ? { status: query.status } : {}),
      ...(query.authorId && { authorId: query.authorId }),
      ...(query.category && { category: { slug: query.category } }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { excerpt: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const orderBy: Prisma.BlogPostOrderByWithRelationInput =
      query.sort === 'popular'
        ? { viewCount: 'desc' }
        : { publishedAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        include: postInclude,
        orderBy,
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  private async findAllMixed(query: {
    page?: number;
    limit?: number;
    status?: BlogStatus | 'ALL';
    authorId?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 12;
    const needed = page * limit;

    const where: Prisma.BlogPostWhereInput = {
      ...(query.status && query.status !== 'ALL' ? { status: query.status } : {}),
      ...(query.authorId && { authorId: query.authorId }),
    };

    const categories = await this.prisma.blogCategory.findMany({
      where: { posts: { some: where } },
      select: { slug: true },
    });

    const categoryOrder = orderCategorySlugs(categories.map((c) => c.slug));
    const perCategory = Math.max(3, Math.ceil(needed / Math.max(categoryOrder.length, 1)) + 2);

    const postsByCategory = await Promise.all(
      categoryOrder.map((slug) =>
        this.prisma.blogPost.findMany({
          where: { ...where, category: { slug } },
          take: perCategory,
          orderBy: { publishedAt: 'desc' },
          include: postInclude,
        }),
      ),
    );

    const buckets = new Map<string, (typeof postsByCategory)[number]>();
    categoryOrder.forEach((slug, index) => {
      buckets.set(slug, postsByCategory[index] ?? []);
    });

    const interleaved = interleavePostsByCategory(buckets, categoryOrder);
    const skip = (page - 1) * limit;
    const data = interleaved.slice(skip, skip + limit);
    const total = await this.prisma.blogPost.count({ where });

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  private async findRelatedPosts(post: {
    id: string;
    categoryId: string;
    specialty: string | null;
    tags: string[];
    author: { doctorProfile: { specialty: string } | null } | null;
  }) {
    const publishedWhere: Prisma.BlogPostWhereInput = {
      status: BlogStatus.PUBLISHED,
      id: { not: post.id },
    };

    const specialty =
      post.specialty ?? post.author?.doctorProfile?.specialty ?? null;

    const relatedIds = new Set<string>();
    const related: Awaited<ReturnType<typeof this.prisma.blogPost.findMany>> = [];

    const pushUnique = (
      items: Awaited<ReturnType<typeof this.prisma.blogPost.findMany>>,
    ) => {
      for (const item of items) {
        if (!relatedIds.has(item.id) && related.length < 6) {
          relatedIds.add(item.id);
          related.push(item);
        }
      }
    };

    if (specialty) {
      pushUnique(
        await this.prisma.blogPost.findMany({
          where: { ...publishedWhere, specialty },
          take: 6,
          orderBy: { publishedAt: 'desc' },
          include: postCardInclude,
        }),
      );
    }

    if (related.length < 6) {
      pushUnique(
        await this.prisma.blogPost.findMany({
          where: { ...publishedWhere, categoryId: post.categoryId },
          take: 6,
          orderBy: { publishedAt: 'desc' },
          include: postCardInclude,
        }),
      );
    }

    if (related.length < 6 && post.tags.length > 0) {
      pushUnique(
        await this.prisma.blogPost.findMany({
          where: {
            ...publishedWhere,
            tags: { hasSome: post.tags },
          },
          take: 6,
          orderBy: { publishedAt: 'desc' },
          include: postCardInclude,
        }),
      );
    }

    if (related.length < 6) {
      pushUnique(
        await this.prisma.blogPost.findMany({
          where: publishedWhere,
          take: 6,
          orderBy: { publishedAt: 'desc' },
          include: postCardInclude,
        }),
      );
    }

    return related;
  }

  private async findTrendingInSpecialty(specialty: string | null, excludeId: string, limit = 3) {
    if (!specialty) return [];

    return this.prisma.blogPost.findMany({
      where: {
        status: BlogStatus.PUBLISHED,
        id: { not: excludeId },
        OR: [{ specialty }, { author: { doctorProfile: { specialty } } }],
      },
      take: limit,
      orderBy: { viewCount: 'desc' },
      select: { id: true, title: true, slug: true, viewCount: true },
    });
  }

  private async findPrevNext(post: { id: string; categoryId: string; publishedAt: Date | null }) {
    if (!post.publishedAt) {
      return { previousPost: null, nextPost: null };
    }

    const baseWhere = {
      status: BlogStatus.PUBLISHED,
      categoryId: post.categoryId,
      id: { not: post.id },
    };

    const [previousPost, nextPost] = await Promise.all([
      this.prisma.blogPost.findFirst({
        where: { ...baseWhere, publishedAt: { lt: post.publishedAt } },
        orderBy: { publishedAt: 'desc' },
        select: { id: true, title: true, slug: true, readTimeMinutes: true },
      }),
      this.prisma.blogPost.findFirst({
        where: { ...baseWhere, publishedAt: { gt: post.publishedAt } },
        orderBy: { publishedAt: 'asc' },
        select: { id: true, title: true, slug: true, readTimeMinutes: true },
      }),
    ]);

    return { previousPost, nextPost };
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
      include: {
        category: true,
        author: { select: authorSelect },
        reviewer: { select: authorSelect },
        comments: {
          where: { status: BlogCommentStatus.APPROVED, parentId: null },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!post) throw new NotFoundException('Blog post not found');

    const specialty = post.specialty ?? post.author.doctorProfile?.specialty ?? post.category.name;

    const [relatedPosts, trendingInSpecialty, { previousPost, nextPost }, authorArticleCount] =
      await Promise.all([
        this.findRelatedPosts({
          id: post.id,
          categoryId: post.categoryId,
          specialty: post.specialty,
          tags: post.tags,
          author: post.author,
        }),
        this.findTrendingInSpecialty(specialty, post.id),
        this.findPrevNext(post),
        this.prisma.blogPost.count({
          where: { authorId: post.authorId, status: BlogStatus.PUBLISHED },
        }),
        this.prisma.blogPost.update({
          where: { id: post.id },
          data: { viewCount: { increment: 1 } },
        }),
      ]);

    const sidebarRelated = relatedPosts.slice(0, 3);

    return {
      ...post,
      specialty,
      authorArticleCount,
      relatedPosts,
      sidebarRelated,
      trendingInSpecialty,
      previousPost,
      nextPost,
    };
  }

  async getCategories() {
    const categories = await this.prisma.blogCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { posts: { where: { status: BlogStatus.PUBLISHED } } },
        },
      },
    });

    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      postCount: c._count.posts,
    }));
  }

  async getPopularTags(limit = 20) {
    const posts = await this.prisma.blogPost.findMany({
      where: { status: BlogStatus.PUBLISHED },
      select: { tags: true },
    });

    const counts = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.tags) {
        const key = tag.toLowerCase();
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  }

  async getPopular(limit = 5) {
    return this.prisma.blogPost.findMany({
      where: { status: BlogStatus.PUBLISHED },
      take: limit,
      orderBy: { viewCount: 'desc' },
      include: postCardInclude,
    });
  }

  async findFeatured(limit = 3) {
    const data = await this.prisma.blogPost.findMany({
      where: { status: BlogStatus.PUBLISHED, featured: true },
      take: limit,
      orderBy: { featuredOrder: 'asc' },
      include: postCardInclude,
    });

    return {
      data,
      meta: { total: data.length, page: 1, limit, totalPages: 1 },
    };
  }

  async getTopAuthors(limit = 5) {
    const groups = await this.prisma.blogPost.groupBy({
      by: ['authorId'],
      where: { status: BlogStatus.PUBLISHED },
      _count: { _all: true },
      _sum: { viewCount: true },
      orderBy: { _count: { authorId: 'desc' } },
      take: limit,
    });

    if (!groups.length) return [];

    const authors = await this.prisma.user.findMany({
      where: { id: { in: groups.map((g) => g.authorId) } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        doctorProfile: { select: { specialty: true, platformRole: true } },
      },
    });

    const authorMap = new Map(authors.map((a) => [a.id, a]));

    return groups
      .map((g) => {
        const author = authorMap.get(g.authorId);
        if (!author) return null;
        return {
          id: author.id,
          firstName: author.firstName,
          lastName: author.lastName,
          avatarUrl: author.avatarUrl,
          specialty: author.doctorProfile?.specialty ?? null,
          platformRole: author.doctorProfile?.platformRole ?? null,
          articleCount: g._count._all,
          totalViews: g._sum.viewCount ?? 0,
        };
      })
      .filter(Boolean);
  }

  private buildPostData(data: CreateBlogPostDto | UpdateBlogPostDto, isCreate = false) {
    const readTimeMinutes =
      data.content !== undefined
        ? data.readTimeMinutes ?? estimateReadTime(data.content)
        : data.readTimeMinutes;

    const payload: Prisma.BlogPostUpdateInput = {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.subtitle !== undefined && { subtitle: data.subtitle }),
      ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.coverImageUrl !== undefined && { coverImageUrl: data.coverImageUrl }),
      ...(data.coverImageAlt !== undefined && { coverImageAlt: data.coverImageAlt }),
      ...(data.coverImageCaption !== undefined && { coverImageCaption: data.coverImageCaption }),
      ...(data.specialty !== undefined && { specialty: data.specialty }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.summaryPoints !== undefined && { summaryPoints: data.summaryPoints }),
      ...(data.keyTakeaways !== undefined && { keyTakeaways: data.keyTakeaways }),
      ...(data.references !== undefined && { references: data.references }),
      ...(data.glossary !== undefined && { glossary: data.glossary }),
      ...(data.medicalDisclaimer !== undefined && { medicalDisclaimer: data.medicalDisclaimer }),
      ...(data.peerReviewed !== undefined && { peerReviewed: data.peerReviewed }),
      ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
      ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription }),
      ...(data.metaKeywords !== undefined && { metaKeywords: data.metaKeywords }),
      ...(data.canonicalUrl !== undefined && { canonicalUrl: data.canonicalUrl }),
      ...(readTimeMinutes !== undefined && { readTimeMinutes }),
      ...(data.featured !== undefined && { featured: data.featured }),
      ...(data.lastReviewedAt !== undefined && {
        lastReviewedAt: data.lastReviewedAt ? new Date(data.lastReviewedAt) : null,
      }),
      ...(data.publishedAt !== undefined && {
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      }),
    };

    if (data.categoryId !== undefined) {
      payload.category = { connect: { id: data.categoryId } };
    }

    if (data.reviewerId !== undefined) {
      payload.reviewer = data.reviewerId
        ? { connect: { id: data.reviewerId } }
        : { disconnect: true };
    }

    if (data.status !== undefined) {
      payload.status = data.status;
      if (isCreate && data.status === BlogStatus.PUBLISHED && !data.publishedAt) {
        payload.publishedAt = new Date();
      }
    }

    return payload;
  }

  async create(authorId: string, data: CreateBlogPostDto) {
    const readTimeMinutes = data.readTimeMinutes ?? estimateReadTime(data.content);

    return this.prisma.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        subtitle: data.subtitle,
        excerpt: data.excerpt,
        content: data.content,
        coverImageUrl: data.coverImageUrl,
        coverImageAlt: data.coverImageAlt,
        coverImageCaption: data.coverImageCaption,
        specialty: data.specialty,
        tags: data.tags ?? [],
        summaryPoints: data.summaryPoints ?? [],
        keyTakeaways: data.keyTakeaways ?? [],
        references: data.references ?? undefined,
        glossary: data.glossary ?? undefined,
        medicalDisclaimer: data.medicalDisclaimer,
        peerReviewed: data.peerReviewed ?? false,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        metaKeywords: data.metaKeywords ?? [],
        canonicalUrl: data.canonicalUrl,
        readTimeMinutes,
        featured: data.featured ?? false,
        status: data.status ?? BlogStatus.DRAFT,
        publishedAt:
          data.publishedAt
            ? new Date(data.publishedAt)
            : data.status === BlogStatus.PUBLISHED
              ? new Date()
              : null,
        lastReviewedAt: data.lastReviewedAt ? new Date(data.lastReviewedAt) : null,
        authorId,
        categoryId: data.categoryId,
        reviewerId: data.reviewerId,
      },
      include: { category: true, author: true },
    });
  }

  async update(slug: string, data: UpdateBlogPostDto) {
    const existing = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!existing) throw new NotFoundException('Blog post not found');

    const payload = this.buildPostData(data);

    if (
      data.status === BlogStatus.PUBLISHED &&
      !existing.publishedAt &&
      data.publishedAt === undefined
    ) {
      payload.publishedAt = new Date();
    }

    return this.prisma.blogPost.update({
      where: { slug },
      data: payload,
      include: { category: true, author: true },
    });
  }

  async submitComment(slug: string, data: SubmitBlogCommentDto) {
    const post = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!post) throw new NotFoundException('Blog post not found');

    return this.prisma.blogComment.create({
      data: {
        postId: post.id,
        authorName: data.authorName,
        authorEmail: data.authorEmail,
        content: data.content,
        parentId: data.parentId,
        status: BlogCommentStatus.PENDING,
      },
    });
  }

  async submitFeedback(slug: string, data: SubmitBlogFeedbackDto, userId?: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!post) throw new NotFoundException('Blog post not found');

    if (data.rating !== undefined) {
      if (data.rating < 1 || data.rating > 5) {
        throw new BadRequestException('Rating must be between 1 and 5');
      }

      const raterKey = userId
        ? `user:${userId}`
        : data.visitorKey?.trim()
          ? `visitor:${data.visitorKey.trim()}`
          : null;

      if (!raterKey) {
        throw new BadRequestException('visitorKey is required when not signed in');
      }

      const existing = await this.prisma.blogPostRating.findUnique({
        where: { postId_raterKey: { postId: post.id, raterKey } },
      });

      if (existing?.rating === data.rating) {
        return {
          helpfulYes: post.helpfulYes,
          helpfulNo: post.helpfulNo,
          averageRating: post.averageRating,
          ratingCount: post.ratingCount,
        };
      }

      let newCount = post.ratingCount;
      let newAverage: number;

      if (existing) {
        const currentTotal = (post.averageRating ?? 0) * post.ratingCount;
        const newTotal = currentTotal - existing.rating + data.rating;
        newAverage = post.ratingCount > 0 ? newTotal / post.ratingCount : data.rating;
      } else {
        const currentTotal = (post.averageRating ?? 0) * post.ratingCount;
        newCount = post.ratingCount + 1;
        newAverage = (currentTotal + data.rating) / newCount;
      }

      const [, updated] = await this.prisma.$transaction([
        this.prisma.blogPostRating.upsert({
          where: { postId_raterKey: { postId: post.id, raterKey } },
          create: {
            postId: post.id,
            raterKey,
            rating: data.rating,
          },
          update: {
            rating: data.rating,
          },
        }),
        this.prisma.blogPost.update({
          where: { id: post.id },
          data: {
            ratingCount: newCount,
            averageRating: newAverage,
          },
          select: {
            helpfulYes: true,
            helpfulNo: true,
            averageRating: true,
            ratingCount: true,
          },
        }),
      ]);

      return updated;
    }

    const updates: Prisma.BlogPostUpdateInput = {};

    if (data.helpful === true) {
      updates.helpfulYes = { increment: 1 };
    } else if (data.helpful === false) {
      updates.helpfulNo = { increment: 1 };
    }

    if (Object.keys(updates).length === 0) {
      throw new BadRequestException('No feedback provided');
    }

    return this.prisma.blogPost.update({
      where: { id: post.id },
      data: updates,
      select: {
        helpfulYes: true,
        helpfulNo: true,
        averageRating: true,
        ratingCount: true,
      },
    });
  }

  async incrementShareCount(slug: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!post) throw new NotFoundException('Blog post not found');

    return this.prisma.blogPost.update({
      where: { id: post.id },
      data: { shareCount: { increment: 1 } },
      select: { shareCount: true },
    });
  }
}
