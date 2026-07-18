import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EditorialReviewStageType, UserRole } from '@prisma/client';
import { Public, Roles } from '../common/decorators/auth.decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { EditorialService } from './editorial.service';
import type { ArticleReviewActionDto, ArticleReviewQueryDto, BulkArticleReviewDto } from './dto/article-review.dto';
import type {
  AuthorGuidelineQueryDto,
  EditorialPolicyQueryDto,
  MedicalReviewStageActionDto,
  RollbackVersionDto,
  UpsertAuthorGuidelineDto,
  UpsertEditorialPolicyDto,
} from './dto/editorial-policy.dto';

@ApiTags('editorial')
@Controller('editorial')
export class EditorialController {
  constructor(private editorialService: EditorialService) {}

  // ─── Article Review Queue ─────────────────────────────────────────────────

  @Get('articles/stats')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  getArticleStats() {
    return this.editorialService.getArticleReviewStats();
  }

  @Get('articles/queue')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  listArticleQueue(@Query() query: ArticleReviewQueryDto, @CurrentUser('id') userId: string, @CurrentUser('role') role: UserRole) {
    if (role === UserRole.DOCTOR) {
      return this.editorialService.listArticleReviewQueue({ ...query, reviewerId: userId });
    }
    return this.editorialService.listArticleReviewQueue(query);
  }

  @Get('articles/:postId/history')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  getArticleHistory(@Param('postId') postId: string) {
    return this.editorialService.getArticleReviewHistory(postId);
  }

  @Post('articles/:postId/action')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  articleAction(
    @Param('postId') postId: string,
    @CurrentUser('id') actorId: string,
    @CurrentUser('role') role: UserRole,
    @Body() body: ArticleReviewActionDto,
  ) {
    return this.editorialService.performArticleAction(postId, actorId, role, body);
  }

  @Post('articles/bulk-action')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  bulkArticleAction(@CurrentUser('id') actorId: string, @Body() body: BulkArticleReviewDto) {
    return this.editorialService.bulkArticleAction(actorId, body);
  }

  // ─── Medical Review ─────────────────────────────────────────────────────────

  @Get('reviewers')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  listReviewers() {
    return this.editorialService.listMedicalReviewers();
  }

  @Get('medical-review')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  getMedicalReview(@Query('postId') postId?: string, @Query('publicationId') publicationId?: string) {
    return this.editorialService.getMedicalReview(postId, publicationId);
  }

  @Patch('medical-review/:reviewId/stages/:stage')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  updateStage(
    @Param('reviewId') reviewId: string,
    @Param('stage') stage: EditorialReviewStageType,
    @CurrentUser('id') actorId: string,
    @Body() body: MedicalReviewStageActionDto & { action: 'assign' | 'complete' | 'request_changes' | 'approve' | 'reject' | 'notes' },
  ) {
    return this.editorialService.updateMedicalReviewStage(reviewId, stage, actorId, body, body.action);
  }

  // ─── Editorial Policies ─────────────────────────────────────────────────────

  @Get('policies')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  listPolicies(@Query() query: EditorialPolicyQueryDto) {
    return this.editorialService.listEditorialPolicies(query);
  }

  @Public()
  @Get('policies/published')
  listPublishedPolicies() {
    return this.editorialService.listEditorialPolicies({ status: 'PUBLISHED' as never, limit: 100 });
  }

  @Get('policies/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getPolicy(@Param('id') id: string) {
    return this.editorialService.getEditorialPolicy(id);
  }

  @Post('policies')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  createPolicy(@CurrentUser('id') actorId: string, @Body() body: UpsertEditorialPolicyDto) {
    return this.editorialService.createEditorialPolicy(actorId, body);
  }

  @Put('policies/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  updatePolicy(@Param('id') id: string, @CurrentUser('id') actorId: string, @Body() body: UpsertEditorialPolicyDto) {
    return this.editorialService.updateEditorialPolicy(id, actorId, body);
  }

  @Post('policies/:id/publish')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  publishPolicy(@Param('id') id: string, @CurrentUser('id') actorId: string) {
    return this.editorialService.publishEditorialPolicy(id, actorId);
  }

  @Post('policies/:id/archive')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  archivePolicy(@Param('id') id: string) {
    return this.editorialService.archiveEditorialPolicy(id);
  }

  @Post('policies/:id/duplicate')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  duplicatePolicy(@Param('id') id: string, @CurrentUser('id') actorId: string) {
    return this.editorialService.duplicateEditorialPolicy(id, actorId);
  }

  @Post('policies/:id/rollback')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  rollbackPolicy(@Param('id') id: string, @CurrentUser('id') actorId: string, @Body() body: RollbackVersionDto) {
    return this.editorialService.rollbackEditorialPolicy(id, body.versionId, actorId);
  }

  @Delete('policies/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  deletePolicy(@Param('id') id: string) {
    return this.editorialService.deleteEditorialPolicy(id);
  }

  // ─── Author Guidelines ──────────────────────────────────────────────────────

  @Get('guidelines')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  listGuidelines(@Query() query: AuthorGuidelineQueryDto) {
    return this.editorialService.listAuthorGuidelines(query);
  }

  @Public()
  @Get('guidelines/published')
  listPublishedGuidelines() {
    return this.editorialService.listAuthorGuidelines({ status: 'PUBLISHED' as never, limit: 100 });
  }

  @Get('guidelines/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getGuideline(@Param('id') id: string) {
    return this.editorialService.getAuthorGuideline(id);
  }

  @Post('guidelines')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  createGuideline(@CurrentUser('id') actorId: string, @Body() body: UpsertAuthorGuidelineDto) {
    return this.editorialService.createAuthorGuideline(actorId, body);
  }

  @Put('guidelines/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  updateGuideline(@Param('id') id: string, @CurrentUser('id') actorId: string, @Body() body: UpsertAuthorGuidelineDto) {
    return this.editorialService.updateAuthorGuideline(id, actorId, body);
  }

  @Post('guidelines/:id/publish')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  publishGuideline(@Param('id') id: string) {
    return this.editorialService.publishAuthorGuideline(id);
  }

  @Post('guidelines/:id/archive')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  archiveGuideline(@Param('id') id: string) {
    return this.editorialService.archiveAuthorGuideline(id);
  }

  @Post('guidelines/:id/duplicate')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  duplicateGuideline(@Param('id') id: string, @CurrentUser('id') actorId: string) {
    return this.editorialService.duplicateAuthorGuideline(id, actorId);
  }

  @Post('guidelines/:id/rollback')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  rollbackGuideline(@Param('id') id: string, @CurrentUser('id') actorId: string, @Body() body: RollbackVersionDto) {
    return this.editorialService.rollbackAuthorGuideline(id, body.versionId, actorId);
  }

  @Post('guidelines/:id/attachments')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  addAttachment(
    @Param('id') id: string,
    @Body() body: { fileName: string; fileUrl: string; fileSize?: number; mimeType?: string },
  ) {
    return this.editorialService.addGuidelineAttachment(id, body);
  }

  @Delete('guidelines/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  deleteGuideline(@Param('id') id: string) {
    return this.editorialService.deleteAuthorGuideline(id);
  }
}
