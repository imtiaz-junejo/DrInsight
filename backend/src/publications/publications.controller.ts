import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import type { Request } from 'express';
import { PublicationsService } from './publications.service';
import { Public, Roles } from '../common/decorators/auth.decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type {
  CreatePublicationDto,
  PublicationQueryDto,
  ReviewPublicationDto,
  UpdatePublicationDto,
} from './dto/publication.dto';

function viewerKey(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0] : req.ip;
  return ip ?? 'anonymous';
}

@ApiTags('publications')
@Controller('publications')
export class PublicationsController {
  constructor(private publicationsService: PublicationsService) {}

  @Public()
  @Get('stats')
  getPublicStats() {
    return this.publicationsService.getPublicStats();
  }

  @Public()
  @Get('specialties')
  getSpecialties() {
    return this.publicationsService.getSpecialties();
  }

  @Public()
  @Get('featured')
  getFeatured(@Query('limit') limit?: number) {
    return this.publicationsService.findFeatured(+limit! || 5);
  }

  @Public()
  @Get('popular')
  getPopular(@Query('limit') limit?: number) {
    return this.publicationsService.findPopular(+limit! || 5);
  }

  @Public()
  @Get('latest')
  getLatest(@Query('limit') limit?: number) {
    return this.publicationsService.findLatest(+limit! || 10);
  }

  @Public()
  @Get('doctor/:doctorId')
  getByDoctor(@Param('doctorId') doctorId: string, @Query('limit') limit?: number) {
    return this.publicationsService.findByDoctorPublic(doctorId, +limit! || 10);
  }

  @Get('me/stats')
  @ApiBearerAuth()
  @Roles(UserRole.DOCTOR)
  getMyStats(@CurrentUser('id') userId: string) {
    return this.publicationsService.getDoctorStats(userId);
  }

  @Get('me')
  @ApiBearerAuth()
  @Roles(UserRole.DOCTOR)
  getMine(@CurrentUser('id') userId: string, @Query() query: PublicationQueryDto) {
    return this.publicationsService.findMine(userId, query);
  }

  @Get('admin/stats')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getAdminStats() {
    return this.publicationsService.getAdminStats();
  }

  @Get('admin')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getAdminList(@Query() query: PublicationQueryDto) {
    return this.publicationsService.findAll(query);
  }

  @Public()
  @Get()
  findPublic(@Query() query: PublicationQueryDto) {
    return this.publicationsService.findAll(query, { approvedOnly: true });
  }

  @Get('detail/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  findById(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.publicationsService.findById(id, userId, role);
  }

  @Public()
  @Get(':slug/related')
  getRelated(@Param('slug') slug: string, @Query('limit') limit?: number) {
    return this.publicationsService.findRelated(slug, +limit! || 6);
  }

  @Public()
  @Get(':slug')
  findBySlug(
    @Param('slug') slug: string,
    @Req() req: Request,
    @CurrentUser('id') userId?: string,
  ) {
    return this.publicationsService.findBySlug(slug, viewerKey(req), userId);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.DOCTOR)
  create(@CurrentUser('id') userId: string, @Body() body: CreatePublicationDto) {
    return this.publicationsService.create(userId, body);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Body() body: UpdatePublicationDto,
  ) {
    return this.publicationsService.update(id, userId, role, body);
  }

  @Post(':id/submit')
  @ApiBearerAuth()
  @Roles(UserRole.DOCTOR)
  submit(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.publicationsService.submit(id, userId);
  }

  @Post(':id/duplicate')
  @ApiBearerAuth()
  @Roles(UserRole.DOCTOR)
  duplicate(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.publicationsService.duplicate(id, userId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.publicationsService.remove(id, userId, role);
  }

  @Post('admin/:id/review')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  review(
    @Param('id') id: string,
    @CurrentUser('id') reviewerId: string,
    @Body() body: ReviewPublicationDto,
  ) {
    return this.publicationsService.review(id, reviewerId, body);
  }

  @Public()
  @Post(':slug/download')
  trackDownload(@Param('slug') slug: string, @Req() req: Request) {
    return this.publicationsService.findBySlug(slug).then((pub) =>
      this.publicationsService.trackDownload(pub.id, viewerKey(req)),
    );
  }

  @Public()
  @Post(':slug/share')
  trackShare(@Param('slug') slug: string) {
    return this.publicationsService.findBySlug(slug).then((pub) =>
      this.publicationsService.trackShare(pub.id),
    );
  }

  @Public()
  @Post(':slug/cite')
  trackCitation(@Param('slug') slug: string, @Req() req: Request) {
    return this.publicationsService.findBySlug(slug).then((pub) =>
      this.publicationsService.trackCitation(pub.id, viewerKey(req)),
    );
  }

  @Post(':slug/bookmark')
  @ApiBearerAuth()
  toggleBookmark(@Param('slug') slug: string, @CurrentUser('id') userId: string) {
    return this.publicationsService.findBySlug(slug).then((pub) =>
      this.publicationsService.toggleBookmark(pub.id, userId),
    );
  }
}
