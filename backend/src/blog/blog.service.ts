import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

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
    sort?: 'recent' | 'popular';
  }) {
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
        include: {
          category: true,
          author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        },
        orderBy,
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
            doctorProfile: {
              select: { specialty: true, hospital: true, credentials: true },
            },
          },
        },
      },
    });
    if (!post) throw new NotFoundException('Blog post not found');

    const [relatedPosts] = await Promise.all([
      this.prisma.blogPost.findMany({
        where: {
          status: BlogStatus.PUBLISHED,
          categoryId: post.categoryId,
          id: { not: post.id },
        },
        take: 4,
        orderBy: { publishedAt: 'desc' },
        include: {
          category: true,
          author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        },
      }),
      this.prisma.blogPost.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } },
      }),
    ]);

    return { ...post, relatedPosts };
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

  async getPopular(limit = 5) {
    return this.prisma.blogPost.findMany({
      where: { status: BlogStatus.PUBLISHED },
      take: limit,
      orderBy: { viewCount: 'desc' },
      include: {
        category: true,
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });
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

  async create(authorId: string, data: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    categoryId: string;
    coverImageUrl?: string;
    tags?: string[];
    status?: BlogStatus;
  }) {
    return this.prisma.blogPost.create({
      data: {
        ...data,
        authorId,
        publishedAt: data.status === BlogStatus.PUBLISHED ? new Date() : null,
      },
      include: { category: true, author: true },
    });
  }
}
