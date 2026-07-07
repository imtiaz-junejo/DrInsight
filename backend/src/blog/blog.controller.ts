import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BlogStatus, UserRole } from '@prisma/client';
import { BlogService } from './blog.service';
import { Public } from '../common/decorators/auth.decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/auth.decorators';

@ApiTags('blog')
@Controller('blog')
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Public()
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('authorId') authorId?: string,
    @Query('sort') sort?: 'recent' | 'popular',
  ) {
    return this.blogService.findAll({
      page: +page! || 1,
      limit: +limit! || 12,
      category,
      search,
      authorId,
      status: BlogStatus.PUBLISHED,
      sort,
    });
  }

  @Get('manage')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  findAllManage(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('authorId') authorId?: string,
    @Query('status') status?: BlogStatus | 'ALL',
    @Query('sort') sort?: 'recent' | 'popular',
  ) {
    return this.blogService.findAll({
      page: +page! || 1,
      limit: +limit! || 12,
      category,
      search,
      authorId,
      status: status || 'ALL',
      sort,
    });
  }

  @Public()
  @Get('categories')
  getCategories() {
    return this.blogService.getCategories();
  }

  @Public()
  @Get('featured')
  getFeatured(@Query('limit') limit?: number) {
    return this.blogService.findFeatured(+limit! || 3);
  }

  @Public()
  @Get('popular')
  getPopular(@Query('limit') limit?: number) {
    return this.blogService.getPopular(+limit! || 5);
  }

  @Public()
  @Get('top-authors')
  getTopAuthors(@Query('limit') limit?: number) {
    return this.blogService.getTopAuthors(+limit! || 5);
  }

  @Public()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  create(@CurrentUser('id') authorId: string, @Body() body: Record<string, unknown>) {
    return this.blogService.create(authorId, body as Parameters<BlogService['create']>[1]);
  }
}
