import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Public, Roles } from '../common/decorators/auth.decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SiteCmsService } from './site-cms.service';
import { SiteConfigurationService } from './site-configuration.service';
import { TrafficAnalyticsService } from './traffic-analytics.service';
import { ConsultationAnalyticsService } from './consultation-analytics.service';

@ApiTags('site-admin')
@Controller('site-admin')
export class SiteAdminController {
  constructor(
    private siteCmsService: SiteCmsService,
    private siteConfigurationService: SiteConfigurationService,
    private trafficAnalyticsService: TrafficAnalyticsService,
    private consultationAnalyticsService: ConsultationAnalyticsService,
  ) {}

  @Get('nav-badges')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getNavBadges() {
    return this.siteCmsService.getNavBadges();
  }

  @Get('faqs')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  listFaqs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('sort') sort?: string,
  ) {
    return this.siteCmsService.listFaqs({ page: page ? +page : undefined, limit: limit ? +limit : undefined, search, category, status, sort });
  }

  @Get('faqs/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getFaq(@Param('id') id: string) {
    return this.siteCmsService.getFaq(id);
  }

  @Post('faqs')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  createFaq(
    @Body()
    body: {
      question: string;
      answer: string;
      category: string;
      isActive?: boolean;
      priority?: number;
      status?: string;
      tags?: string[];
      relatedSpecialty?: string;
      relatedService?: string;
    },
  ) {
    return this.siteCmsService.createFaq(body);
  }

  @Post('faqs/:id/duplicate')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  duplicateFaq(@Param('id') id: string) {
    return this.siteCmsService.duplicateFaq(id);
  }

  @Patch('faqs/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  updateFaq(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      question: string;
      answer: string;
      category: string;
      isActive: boolean;
      displayOrder: number;
      priority: number;
      status: string;
      tags: string[];
      relatedSpecialty: string;
      relatedService: string;
    }>,
  ) {
    return this.siteCmsService.updateFaq(id, body);
  }

  @Delete('faqs/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  deleteFaq(@Param('id') id: string) {
    return this.siteCmsService.deleteFaq(id);
  }

  @Get('homepage-sections')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  listHomepageSections() {
    return this.siteCmsService.listHomepageSections();
  }

  @Get('homepage-sections/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getHomepageSection(@Param('id') id: string) {
    return this.siteCmsService.getHomepageSection(id);
  }

  @Patch('homepage-sections/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  updateHomepageSection(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      title: string;
      isVisible: boolean;
      displayOrder: number;
      config: object;
      draftConfig: object;
      status: string;
    }>,
  ) {
    return this.siteCmsService.updateHomepageSection(id, body);
  }

  @Patch('homepage-sections/:id/draft')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  saveHomepageDraft(
    @Param('id') id: string,
    @Body() body: { title?: string; isVisible?: boolean; draftConfig?: object },
  ) {
    return this.siteCmsService.saveHomepageSectionDraft(id, body);
  }

  @Post('homepage-sections/:id/publish')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  publishHomepageSection(@Param('id') id: string) {
    return this.siteCmsService.publishHomepageSection(id);
  }

  @Post('homepage-sections/:id/revert')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  revertHomepageSection(@Param('id') id: string) {
    return this.siteCmsService.revertHomepageSection(id);
  }

  @Post('homepage-sections/:id/duplicate')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  duplicateHomepageSection(@Param('id') id: string) {
    return this.siteCmsService.duplicateHomepageSection(id);
  }

  @Patch('homepage-sections/reorder')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  reorderHomepageSections(@Body() body: { items: Array<{ id: string; displayOrder: number }> }) {
    return this.siteCmsService.reorderHomepageSections(body.items);
  }

  @Post('homepage-sections/publish')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  publishHomepageSections() {
    return this.siteCmsService.publishHomepageSections();
  }

  @Get('seo/pages')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  listSeoPages() {
    return this.siteCmsService.listSeoPages();
  }

  @Get('seo/pages/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getSeoPage(@Param('id') id: string) {
    return this.siteCmsService.getSeoPage(id);
  }

  @Post('seo/pages/:id/reset')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  resetSeoPage(@Param('id') id: string) {
    return this.siteCmsService.resetSeoPage(id);
  }

  @Patch('seo/pages/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  updateSeoPage(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      pageName: string;
      path: string;
      metaTitle: string;
      metaDescription: string;
      metaKeywords: string[];
      canonicalUrl: string;
      ogTitle: string;
      ogDescription: string;
      ogImageUrl: string;
      twitterCard: string;
      robots: string;
      schemaJson: object;
      sitemapPriority: number;
      slug: string;
      status: string;
    }>,
  ) {
    return this.siteCmsService.updateSeoPage(id, body);
  }

  @Get('seo/global')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getGlobalSeo() {
    return this.siteCmsService.getGlobalSeo();
  }

  @Patch('seo/global')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  updateGlobalSeo(
    @Body()
    body: {
      siteTitle?: string;
      defaultMetaTitleSuffix?: string;
      defaultMetaDescription?: string;
      defaultMetaKeywords?: string;
      ogTitle?: string;
      ogDescription?: string;
      twitterHandle?: string;
      globalSchemaJson?: object;
      googleSearchConsole?: string;
      googleAnalyticsId?: string;
      xmlSitemapUrl?: string;
      robotsTxt?: string;
      sitemapXml?: string;
      siteUrl?: string;
      faviconUrl?: string;
      socialSharingImageUrl?: string;
    },
  ) {
    return this.siteCmsService.updateGlobalSeo(body);
  }

  @Post('seo/sitemap/regenerate')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  regenerateSitemap() {
    return this.siteCmsService.regenerateSitemapXml();
  }

  @Get('cms-pages/:slug')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getCmsPage(@Param('slug') slug: string) {
    return this.siteCmsService.getCmsPage(slug);
  }

  @Patch('cms-pages/:slug')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  updateCmsPage(
    @Param('slug') slug: string,
    @Body()
    body: {
      title?: string;
      heroSubtitle?: string;
      lastUpdated?: string;
      version?: string;
      extra?: object;
    },
  ) {
    return this.siteCmsService.updateCmsPage(slug, body);
  }

  @Post('cms-pages/:slug/sections')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  createCmsSection(
    @Param('slug') slug: string,
    @Body() body: { title: string; contentHtml?: string },
  ) {
    return this.siteCmsService.createCmsSection(slug, body);
  }

  @Patch('cms-sections/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  updateCmsSection(
    @Param('id') id: string,
    @Body() body: Partial<{ title: string; contentHtml: string; isVisible: boolean }>,
  ) {
    return this.siteCmsService.updateCmsSection(id, body);
  }

  @Get('health-tools')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  listHealthTools() {
    return this.siteCmsService.listHealthTools();
  }

  @Get('health-tools/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getHealthTool(@Param('id') id: string) {
    return this.siteCmsService.getHealthTool(id);
  }

  @Delete('health-tools/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  deleteHealthTool(@Param('id') id: string) {
    return this.siteCmsService.deleteHealthTool(id);
  }

  @Patch('health-tools/reorder')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  reorderHealthTools(@Body() body: { items: Array<{ id: string; displayOrder: number }> }) {
    return this.siteCmsService.reorderHealthTools(body.items);
  }

  @Post('health-tools')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  createHealthTool(
    @Body()
    body: {
      slug: string;
      name: string;
      description?: string;
      iconEmoji?: string;
      isActive?: boolean;
      category?: string;
      route?: string;
      featured?: boolean;
      seoTitle?: string;
      seoDescription?: string;
      metaKeywords?: string[];
      settings?: object;
    },
  ) {
    return this.siteCmsService.createHealthTool(body);
  }

  @Patch('health-tools/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  updateHealthTool(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      name: string;
      description: string;
      iconEmoji: string;
      isActive: boolean;
      displayOrder: number;
      category: string;
      route: string;
      featured: boolean;
      seoTitle: string;
      seoDescription: string;
      metaKeywords: string[];
      settings: object;
    }>,
  ) {
    return this.siteCmsService.updateHealthTool(id, body);
  }

  @Get('review-process')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getReviewProcess() {
    return this.siteCmsService.getReviewProcess();
  }

  @Put('review-process')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  updateReviewProcess(
    @Body()
    body: {
      tier1MinYears?: number;
      tier2MinYears?: number;
      reviewDeadlineDays?: number;
      maxRevisionCycles?: number;
      authorRevisionWindowDays?: number;
      minSourcesPerArticle?: number;
    },
  ) {
    return this.siteCmsService.updateReviewProcess(body);
  }

  @Patch('content-currency/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  updateContentCurrency(@Param('id') id: string, @Body() body: { reviewCycleMonths: number }) {
    return this.siteCmsService.updateContentCurrencySchedule(id, body.reviewCycleMonths);
  }

  @Get('roles')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getRolesMatrix() {
    return this.siteCmsService.getRolesMatrix();
  }

  @Patch('roles/:roleId/permissions/:permissionId')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  updateRolePermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
    @Body() body: { enabled: boolean },
  ) {
    return this.siteCmsService.updateRolePermission(roleId, permissionId, body.enabled);
  }

  @Get('analytics/traffic')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getTrafficAnalytics(
    @Query('range') range?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.trafficAnalyticsService.getDashboard({ range, from, to });
  }

  @Get('analytics/consultations')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getConsultationAnalytics(
    @Query('range') range?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.consultationAnalyticsService.getDashboard({ range, from, to });
  }

  @Public()
  @Get('public/homepage-sections')
  getPublicHomepageSections() {
    return this.siteCmsService.listPublicHomepageSections();
  }

  @Public()
  @Get('public/faqs')
  getPublicFaqs() {
    return this.siteCmsService.listPublicFaqs();
  }

  @Public()
  @Get('public/health-tools')
  getPublicHealthTools() {
    return this.siteCmsService.listPublicHealthTools();
  }

  @Public()
  @Get('public/seo')
  async getPublicSeo(@Query('path') path: string) {
    const page = await this.siteCmsService.getPublicSeoByPath(path || '/');
    return page ?? {};
  }

  @Public()
  @Post('public/health-tools/:slug/usage')
  trackHealthToolUsage(
    @Param('slug') slug: string,
    @Body() body: { sessionId?: string },
  ) {
    return this.siteCmsService.trackHealthToolUsage(slug, body.sessionId);
  }

  @Public()
  @Post('analytics/page-view')
  recordPageView(
    @Body()
    body: { path: string; referrer?: string; sessionId?: string; durationSeconds?: number },
  ) {
    return this.trafficAnalyticsService.recordPageView(body);
  }

  @Get('configuration/branding')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getBranding() {
    return this.siteConfigurationService.getBranding();
  }

  @Patch('configuration/branding')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  updateBranding(
    @Body()
    body: {
      logoUrl?: string;
      faviconUrl?: string;
      footerLogoUrl?: string;
      heroImageUrl?: string;
      wordmarkText?: string;
      tagline?: string;
    },
  ) {
    return this.siteConfigurationService.updateBranding(body);
  }

  @Patch('configuration/page-hero/:pageId')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  setPageHero(@Param('pageId') pageId: string, @Body() body: { imageUrl: string | null }) {
    return this.siteConfigurationService.setPageHero(pageId, body.imageUrl);
  }

  @Delete('configuration/media/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  deleteMediaAsset(@Param('id') id: string) {
    return this.siteConfigurationService.deleteMediaAsset(id);
  }

  @Get('configuration/menus')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getMenus() {
    return this.siteConfigurationService.getMenus();
  }

  @Put('configuration/menus')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  updateMenus(@Body() body: { header?: Array<{ label: string; href: string }>; footer?: Array<{ label: string; href: string }> }) {
    return this.siteConfigurationService.updateMenus(body);
  }

  @Get('configuration/contact')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getContactDetails() {
    return this.siteConfigurationService.getContactDetails();
  }

  @Patch('configuration/contact')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  updateContactDetails(
    @Body()
    body: {
      phone?: string;
      whatsapp?: string;
      email?: string;
      hours?: string;
      address?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      country?: string;
      map?: string;
    },
  ) {
    return this.siteConfigurationService.updateContactDetails(body);
  }

  @Get('configuration/advertisements')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getAdvertisements() {
    return this.siteConfigurationService.getAdvertisements();
  }

  @Patch('configuration/advertisements')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  updateAdvertisements(
    @Body()
    body: { adsense?: string; banner?: string; sidebar?: string; inarticle?: string },
  ) {
    return this.siteConfigurationService.updateAdvertisements(body);
  }

  @Get('configuration/settings')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getGeneralSettings() {
    return this.siteConfigurationService.getGeneralSettings();
  }

  @Patch('configuration/settings')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  updateGeneralSettings(
    @Body()
    body: {
      siteName?: string;
      siteUrl?: string;
      timezone?: string;
      smtpHost?: string;
      smtpFrom?: string;
      smtpPassword?: string;
      emailJsServiceId?: string;
      emailJsTemplateId?: string;
      emailJsPublicKey?: string;
      smsProvider?: 'textbelt' | 'custom';
      smsApiKey?: string;
      smsCustomUrl?: string;
      smsSenderName?: string;
      smsTestNumber?: string;
      socialLinks?: {
        facebook?: string;
        twitter?: string;
        instagram?: string;
        linkedin?: string;
        youtube?: string;
      };
    },
  ) {
    return this.siteConfigurationService.updateGeneralSettings(body);
  }

  @Post('configuration/settings/test-sms')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  testSmsOtp(@Body() body: { phone: string }) {
    return this.siteConfigurationService.sendTestSmsOtp(body.phone);
  }

  @Get('configuration/security')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getSecuritySettings() {
    return this.siteConfigurationService.getSecuritySettings();
  }

  @Patch('configuration/security')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  updateSecuritySettings(@Body() body: { requireTwoFactor?: boolean }) {
    return this.siteConfigurationService.updateSecuritySettings(body);
  }

  @Post('configuration/security/change-password')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  changeAdminPassword(
    @CurrentUser() user: { id: string },
    @Body() body: { newPassword: string; confirmPassword: string },
  ) {
    return this.siteConfigurationService.changeAdminPassword(
      user.id,
      body.newPassword,
      body.confirmPassword,
    );
  }

  @Get('configuration/backup/export')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  exportBackup() {
    return this.siteConfigurationService.exportBackup();
  }

  @Post('configuration/backup/restore')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  restoreBackup(@CurrentUser() user: { id: string }, @Body() body: Record<string, unknown>) {
    return this.siteConfigurationService.restoreBackup(body, user.id);
  }

  @Public()
  @Get('public/site-config')
  getPublicSiteConfig() {
    return this.siteConfigurationService.getPublicSiteConfig();
  }

  @Public()
  @Get('public/advertisements')
  getPublicAdvertisements() {
    return this.siteConfigurationService.getPublicAdvertisements();
  }
}
