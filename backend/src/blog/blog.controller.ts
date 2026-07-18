import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BlogCommentStatus, BlogStatus, UserRole } from '@prisma/client';
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
import type { CreateBlogCategoryDto, UpdateBlogCategoryDto } from './dto/blog-category.dto';
import type { CreateBlogTagDto, UpdateBlogTagDto } from './dto/blog-tag.dto';

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

  @Get('manage/stats')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getManageStats() {
    return this.blogService.getManageStats();
  }

  @Get('saved')
  @ApiBearerAuth()
  @Roles(UserRole.PATIENT)
  findSaved(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.blogService.findSavedForUser(userId, { page: +page! || 1, limit: +limit! || 20 });
  }

  @Post('saved/:slug')
  @ApiBearerAuth()
  @Roles(UserRole.PATIENT)
  saveBookmark(@CurrentUser('id') userId: string, @Param('slug') slug: string) {
    return this.blogService.saveBookmark(userId, slug);
  }

  @Delete('saved/:slug')
  @ApiBearerAuth()
  @Roles(UserRole.PATIENT)
  removeBookmark(@CurrentUser('id') userId: string, @Param('slug') slug: string) {
    return this.blogService.removeBookmark(userId, slug);
  }

  @Patch('saved/:slug')
  @ApiBearerAuth()
  @Roles(UserRole.PATIENT)
  updateBookmarkProgress(
    @CurrentUser('id') userId: string,
    @Param('slug') slug: string,
    @Body('readPercent') readPercent: number,
  ) {
    return this.blogService.updateBookmarkProgress(userId, slug, Math.min(100, Math.max(0, +readPercent || 0)));
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
    @Query('tag') tag?: string,
    @Query('status') status?: BlogStatus | 'ALL',
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('sort') sort?: 'recent' | 'popular' | 'title' | 'oldest',
  ) {
    return this.blogService.findAll({
      page: +page! || 1,
      limit: +limit! || 12,
      category,
      search,
      authorId,
      tag,
      status: status || 'ALL',
      dateFrom,
      dateTo,
      sort,
    });
  }

  @Get('manage/:slug')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  findBySlugManage(@Param('slug') slug: string) {
    return this.blogService.findBySlugForManage(slug);
  }

  @Post('manage/:slug/publish')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  publishPost(@Param('slug') slug: string) {
    return this.blogService.publishPost(slug);
  }

  @Post('manage/:slug/unpublish')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  unpublishPost(@Param('slug') slug: string) {
    return this.blogService.unpublishPost(slug);
  }

  @Post('manage/:slug/archive')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  archivePost(@Param('slug') slug: string) {
    return this.blogService.archivePost(slug);
  }

  @Post('manage/:slug/duplicate')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  duplicatePost(@Param('slug') slug: string) {
    return this.blogService.duplicatePost(slug);
  }

  @Delete('manage/:slug')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  deletePost(@Param('slug') slug: string) {
    return this.blogService.delete(slug);
  }

  @Public()
  @Get('categories')
  getCategories() {
    return this.blogService.getCategories();
  }

  @Get('categories/manage')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  findCategoriesAdmin(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('sort') sort?: 'name' | 'posts' | 'recent',
  ) {
    return this.blogService.findCategoriesAdmin({
      page: +page! || 1,
      limit: +limit! || 20,
      search,
      sort,
    });
  }

  @Post('categories')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  createCategory(@Body() body: CreateBlogCategoryDto) {
    return this.blogService.createCategory(body);
  }

  @Patch('categories/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  updateCategory(@Param('id') id: string, @Body() body: UpdateBlogCategoryDto) {
    return this.blogService.updateCategory(id, body);
  }

  @Delete('categories/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  deleteCategory(@Param('id') id: string) {
    return this.blogService.deleteCategory(id);
  }

  @Public()
  @Get('tags/popular')
  getPopularTags(@Query('limit') limit?: number) {
    return this.blogService.getPopularTags(+limit! || 20);
  }

  @Get('tags/manage')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  findTagsAdmin(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('sort') sort?: 'name' | 'posts' | 'recent',
  ) {
    return this.blogService.findTagsAdmin({
      page: +page! || 1,
      limit: +limit! || 20,
      search,
      sort,
    });
  }

  @Post('tags')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  createTag(@Body() body: CreateBlogTagDto) {
    return this.blogService.createTag(body);
  }

  @Patch('tags/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  updateTag(@Param('id') id: string, @Body() body: UpdateBlogTagDto) {
    return this.blogService.updateTag(id, body);
  }

  @Delete('tags/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  deleteTag(@Param('id') id: string) {
    return this.blogService.deleteTag(id);
  }

  @Get('authors/manage')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  findAuthorsAdmin(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.blogService.findAuthorsAdmin({
      page: +page! || 1,
      limit: +limit! || 20,
      search,
    });
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

  @Get('comments/manage')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  findCommentsAdmin(
    @Query('status') status?: BlogCommentStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.blogService.findCommentsAdmin({
      status,
      page: +page! || 1,
      limit: +limit! || 20,
      search,
    });
  }

  @Patch('comments/:id/status')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  updateCommentStatus(@Param('id') id: string, @Body() body: { status: BlogCommentStatus }) {
    return this.blogService.updateCommentStatus(id, body.status);
  }

  @Delete('comments/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  deleteComment(@Param('id') id: string) {
    return this.blogService.deleteComment(id);
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
