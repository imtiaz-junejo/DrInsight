import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; category?: string; search?: string; status?: BlogStatus }) {
    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;
    const status = query.status || BlogStatus.PUBLISHED;

    const where: Prisma.BlogPostWhereInput = {
      status,
      ...(query.category && { category: { slug: query.category } }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { excerpt: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        },
        orderBy: { publishedAt: 'desc' },
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
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } },
      },
    });
    if (!post) throw new NotFoundException('Blog post not found');

    await this.prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    return post;
  }

  async getCategories() {
    return this.prisma.blogCategory.findMany({ orderBy: { name: 'asc' } });
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
