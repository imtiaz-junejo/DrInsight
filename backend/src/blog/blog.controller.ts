import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BlogStatus, UserRole } from '@prisma/client';
import { BlogService } from './blog.service';
import { Public, Roles } from '../common/decorators/auth.decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import type {
  CreateBlogPostDto,
  SubmitBlogCommentDto,
  SubmitBlogFeedbackDto,
  UpdateBlogPostDto,
} from './dto/blog-post.dto';

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
    @Query('sort') sort?: 'recent' | 'popular' | 'mixed',
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
  @Get('tags/popular')
  getPopularTags(@Query('limit') limit?: number) {
    return this.blogService.getPopularTags(+limit! || 20);
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
  create(@CurrentUser('id') authorId: string, @Body() body: CreateBlogPostDto) {
    return this.blogService.create(authorId, body);
  }

  @Patch(':slug')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  update(@Param('slug') slug: string, @Body() body: UpdateBlogPostDto) {
    return this.blogService.update(slug, body);
  }

  @Public()
  @Post(':slug/comments')
  submitComment(@Param('slug') slug: string, @Body() body: SubmitBlogCommentDto) {
    return this.blogService.submitComment(slug, body);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Post(':slug/feedback')
  submitFeedback(
    @Param('slug') slug: string,
    @Body() body: SubmitBlogFeedbackDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.blogService.submitFeedback(slug, body, userId);
  }

  @Public()
  @Post(':slug/share')
  incrementShare(@Param('slug') slug: string) {
    return this.blogService.incrementShareCount(slug);
  }
}
