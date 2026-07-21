import { Injectable, NotFoundException } from '@nestjs/common';
import {
  BlogCommentStatus,
  BlogStatus,
  ContactInquiryStatus,
  Prisma,
  PublicationStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SiteCmsService {
  constructor(private prisma: PrismaService) {}

  async getNavBadges() {
    const onlineTypes = ['VIDEO', 'AUDIO', 'CHAT'] as const;
    const [
      pendingUsers,
      pendingOnlineAppointments,
      ongoingOnlineAppointments,
      pendingPhysicalAppointments,
      pendingQuestions,
      pendingComments,
      draftPosts,
      pendingPublications,
      unreadContacts,
      openAuditAlerts,
      failedWhrEmails,
    ] = await Promise.all([
      this.prisma.user.count({ where: { status: UserStatus.PENDING } }),
      this.prisma.appointment.count({
        where: { status: 'PENDING', consultationType: { in: [...onlineTypes] } },
      }),
      this.prisma.appointment.count({
        where: { status: 'IN_PROGRESS', consultationType: { in: [...onlineTypes] } },
      }),
      this.prisma.appointment.count({
        where: { status: 'PENDING', consultationType: 'IN_PERSON' },
      }),
      this.prisma.askDoctorQuestion.count({ where: { status: 'PENDING' } }),
      this.prisma.blogComment.count({ where: { status: BlogCommentStatus.PENDING } }),
      this.prisma.blogPost.count({
        where: {
          status: {
            in: [
              BlogStatus.SUBMITTED,
              BlogStatus.UNDER_MEDICAL_REVIEW,
              BlogStatus.NEEDS_REVISION,
              BlogStatus.DRAFT,
            ],
          },
        },
      }),
      this.prisma.publication.count({
        where: { status: { in: [PublicationStatus.SUBMITTED, PublicationStatus.UNDER_REVIEW] } },
      }),
      this.prisma.contactSubmission.count({ where: { status: ContactInquiryStatus.NEW } }),
      this.prisma.auditLogEntry.count({
        where: {
          severity: { in: ['CRITICAL', 'WARNING'] },
          acknowledgedAt: null,
          result: { in: ['FAILED', 'BLOCKED'] },
        },
      }),
      this.prisma.womensHealthReminderLog.count({ where: { status: 'Failed' } }),
    ]);

    return {
      'audit-log': openAuditAlerts,
      'qa-pending': pendingQuestions,
      'oc-pending': pendingOnlineAppointments,
      'oc-ongoing': ongoingOnlineAppointments,
      'phys-pending': pendingPhysicalAppointments,
      'consult-requests': pendingOnlineAppointments,
      comments: pendingComments,
      'review-queue': draftPosts,
      'publication-review': pendingPublications,
      'contact-inquiries': unreadContacts,
      users: pendingUsers,
      whr: failedWhrEmails,
    };
  }

  // FAQs
  async listFaqs(query?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    sort?: string;
  }) {
    const page = query?.page || 1;
    const limit = query?.limit || 100;
    const skip = (page - 1) * limit;
    const where = {
      ...(query?.category && { category: query.category }),
      ...(query?.status && { status: query.status as never }),
      ...(query?.search && {
        OR: [
          { question: { contains: query.search, mode: 'insensitive' as const } },
          { answer: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };
    const orderBy =
      query?.sort === 'priority'
        ? [{ priority: 'desc' as const }, { displayOrder: 'asc' as const }]
        : query?.sort === 'oldest'
          ? { createdAt: 'asc' as const }
          : [{ displayOrder: 'asc' as const }, { createdAt: 'desc' as const }];

    const [data, total] = await Promise.all([
      this.prisma.faq.findMany({ where, skip, take: limit, orderBy }),
      this.prisma.faq.count({ where }),
    ]);
    if (!query?.page) return data;
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async listPublicFaqs() {
    return this.prisma.faq.findMany({
      where: { isActive: true, status: 'PUBLISHED' },
      orderBy: [{ displayOrder: 'asc' }, { priority: 'desc' }],
    });
  }

  async getFaq(id: string) {
    const faq = await this.prisma.faq.findUnique({ where: { id } });
    if (!faq) throw new NotFoundException('FAQ not found');
    return faq;
  }

  async createFaq(data: {
    question: string;
    answer: string;
    category: string;
    isActive?: boolean;
    priority?: number;
    status?: string;
    tags?: string[];
    relatedSpecialty?: string;
    relatedService?: string;
    displayOrder?: number;
  }) {
    const maxOrder = await this.prisma.faq.aggregate({ _max: { displayOrder: true } });
    return this.prisma.faq.create({
      data: {
        question: data.question,
        answer: data.answer,
        category: data.category,
        isActive: data.isActive ?? true,
        priority: data.priority ?? 0,
        status: (data.status as never) ?? 'PUBLISHED',
        tags: data.tags ?? [],
        relatedSpecialty: data.relatedSpecialty,
        relatedService: data.relatedService,
        displayOrder: data.displayOrder ?? (maxOrder._max.displayOrder ?? 0) + 1,
      },
    });
  }

  async duplicateFaq(id: string) {
    const source = await this.getFaq(id);
    return this.createFaq({
      question: `${source.question} (Copy)`,
      answer: source.answer,
      category: source.category,
      priority: source.priority,
      tags: source.tags,
      relatedSpecialty: source.relatedSpecialty ?? undefined,
      relatedService: source.relatedService ?? undefined,
      status: 'DRAFT',
      isActive: false,
    });
  }

  async updateFaq(
    id: string,
    data: Partial<{
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
    const payload = { ...data };
    if (data.status) payload.status = data.status as never;
    return this.prisma.faq.update({ where: { id }, data: payload as never });
  }

  async deleteFaq(id: string) {
    return this.prisma.faq.delete({ where: { id } });
  }

  async getFaqStats() {
    const [total, approved, pending, rejected] = await Promise.all([
      this.prisma.faq.count(),
      this.prisma.faq.count({ where: { isActive: true } }),
      this.prisma.faq.count({ where: { isActive: false } }),
      0,
    ]);
    return { total, approved, pending, rejected };
  }

  // Homepage sections
  async listHomepageSections() {
    const sections = await this.prisma.homepageSection.findMany({ orderBy: { displayOrder: 'asc' } });
    if (sections.length > 0) return sections;
    const defaults = [
      { title: 'Hero Banner', slug: 'hero-banner' },
      { title: 'Hero Buttons', slug: 'hero-buttons' },
      { title: 'Hero Statistics', slug: 'hero-statistics' },
      { title: 'Trust Badges Strip', slug: 'trust-badges' },
      { title: 'Featured Doctors', slug: 'featured-doctors' },
      { title: 'Medical Specialties', slug: 'featured-specialties' },
      { title: 'Our Services', slug: 'our-services' },
      { title: 'Why Choose DrInsight', slug: 'why-choose' },
      { title: 'Top Health Tools', slug: 'top-health-tools' },
      { title: 'Latest Articles', slug: 'latest-articles' },
      { title: 'Featured Research', slug: 'featured-research' },
      { title: 'Meet Our Doctors', slug: 'meet-doctors' },
      { title: 'Patient Testimonials', slug: 'patient-testimonials' },
      { title: 'Success Statistics', slug: 'statistics-counter' },
      { title: 'Partner Hospitals', slug: 'partner-hospitals' },
      { title: 'Health Tools Section', slug: 'health-tools-section' },
      { title: 'FAQ Preview', slug: 'faq-preview' },
      { title: 'Newsletter Signup', slug: 'newsletter-signup' },
      { title: 'Footer Call-to-Action', slug: 'footer-cta' },
      { title: 'App Download CTA', slug: 'app-download-cta' },
    ];
    await this.prisma.homepageSection.createMany({
      data: defaults.map((item, index) => ({
        slug: item.slug,
        title: item.title,
        displayOrder: index + 1,
        isVisible: true,
        status: 'PUBLISHED',
      })),
      skipDuplicates: true,
    });
    return this.prisma.homepageSection.findMany({ orderBy: { displayOrder: 'asc' } });
  }

  async listPublicHomepageSections() {
    const sections = await this.listHomepageSections();
    return sections
      .filter((s) => s.isVisible && s.status === 'PUBLISHED')
      .map((s) => ({
        ...s,
        config: s.config ?? {},
      }));
  }

  async getHomepageSection(id: string) {
    const section = await this.prisma.homepageSection.findUnique({ where: { id } });
    if (!section) throw new NotFoundException('Homepage section not found');
    return section;
  }

  async duplicateHomepageSection(id: string) {
    const source = await this.getHomepageSection(id);
    const slug = `${source.slug}-copy-${Date.now()}`;
    const maxOrder = await this.prisma.homepageSection.aggregate({ _max: { displayOrder: true } });
    return this.prisma.homepageSection.create({
      data: {
        slug,
        title: `${source.title} (Copy)`,
        displayOrder: (maxOrder._max.displayOrder ?? 0) + 1,
        isVisible: false,
        status: 'DRAFT',
        config: source.config ?? undefined,
        draftConfig: source.draftConfig ?? source.config ?? undefined,
      },
    });
  }

  async saveHomepageSectionDraft(
    id: string,
    data: { title?: string; isVisible?: boolean; draftConfig?: object },
  ) {
    return this.prisma.homepageSection.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.isVisible !== undefined && { isVisible: data.isVisible }),
        ...(data.draftConfig !== undefined && { draftConfig: data.draftConfig }),
        status: 'DRAFT',
      },
    });
  }

  async publishHomepageSection(id: string) {
    const section = await this.getHomepageSection(id);
    const config = section.draftConfig ?? section.config;
    return this.prisma.homepageSection.update({
      where: { id },
      data: { config: (config ?? undefined) as Prisma.InputJsonValue, status: 'PUBLISHED', draftConfig: Prisma.JsonNull },
    });
  }

  async revertHomepageSection(id: string) {
    const section = await this.getHomepageSection(id);
    return this.prisma.homepageSection.update({
      where: { id },
      data: { draftConfig: section.config ?? undefined, status: 'PUBLISHED' },
    });
  }

  async updateHomepageSection(
    id: string,
    data: Partial<{
      title: string;
      isVisible: boolean;
      displayOrder: number;
      config: object;
      draftConfig: object;
      status: string;
    }>,
  ) {
    return this.prisma.homepageSection.update({ where: { id }, data: data as never });
  }

  async reorderHomepageSections(items: Array<{ id: string; displayOrder: number }>) {
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.homepageSection.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        }),
      ),
    );
    return this.listHomepageSections();
  }

  async publishHomepageSections() {
    const sections = await this.prisma.homepageSection.findMany({
      where: { draftConfig: { not: Prisma.DbNull } },
    });
    await this.prisma.$transaction(
      sections.map((s) =>
        this.prisma.homepageSection.update({
          where: { id: s.id },
          data: {
            config: (s.draftConfig ?? s.config ?? undefined) as Prisma.InputJsonValue,
            draftConfig: Prisma.JsonNull,
            status: 'PUBLISHED',
          },
        }),
      ),
    );
    return { success: true, published: sections.length };
  }

  // SEO
  async listSeoPages(query?: { search?: string; page?: number; limit?: number }) {
    const where = query?.search
      ? {
          OR: [
            { pageName: { contains: query.search, mode: 'insensitive' as const } },
            { path: { contains: query.search, mode: 'insensitive' as const } },
          ],
        }
      : {};
    const pages = await this.prisma.seoPageSetting.findMany({
      where,
      orderBy: { path: 'asc' },
      ...(query?.limit && { take: query.limit, skip: ((query.page || 1) - 1) * query.limit }),
    });
    if (pages.length > 0) return pages;
    const defaults = [
      ['Homepage', '/', 'DrInsight — Trusted, Doctor-Reviewed Medical Information'],
      ['About Us', '/about', 'About DrInsight — Our Mission, Doctors & Editorial Standards'],
      ['Blog', '/blog', 'Medical Health Articles — Expert Doctor-Written Guides | DrInsight'],
      ['Find a Doctor', '/doctors', 'Find a Doctor — Board-Certified Specialists | DrInsight'],
      ['Health Tools', '/health-tools', 'Free Health Tools & Medical Calculators | DrInsight'],
      ['Book Consultation', '/book-consultation', 'Book an Online Doctor Consultation — Video, Phone or Chat | DrInsight'],
      ['Ask a Doctor', '/ask-the-doctor', 'Ask a Doctor Online — Get Answers from Real Specialists | DrInsight'],
      ['Contact', '/contact', 'Contact DrInsight — Get in Touch With Our Team'],
      ['FAQ', '/faq', 'Frequently Asked Questions | DrInsight'],
      ['Medical Review Process', '/medical-review-process', 'Medical Review Process — How We Ensure Accuracy | DrInsight'],
      ['Editorial Policy', '/editorial-policy', 'Editorial Policy — How We Ensure Medical Accuracy | DrInsight'],
      ['Author Guidelines', '/author-guidelines', 'Author Guidelines — Write Medical Articles for DrInsight'],
      ['Privacy Policy', '/privacy-policy', 'Privacy Policy | DrInsight'],
      ['Terms & Conditions', '/terms-conditions', 'Terms & Conditions | DrInsight'],
      ['Disclaimer', '/disclaimer', 'Medical Disclaimer | DrInsight'],
      ['Cookie Policy', '/cookie-policy', 'Cookie Policy | DrInsight'],
      ['Sitemap', '/sitemap', 'Sitemap | DrInsight'],
      ['Login', '/login', 'Login | DrInsight'],
      ['Register', '/register', 'Create Your DrInsight Account'],
      ['Forgot Password', '/forgot-password', 'Reset Your Password | DrInsight'],
      ['Reset Password', '/reset-password', 'Set a New Password | DrInsight'],
      ['404 — Not Found', '/404', 'Page Not Found | DrInsight'],
    ];
    await this.prisma.seoPageSetting.createMany({
      data: defaults.map(([pageName, path, metaTitle]) => ({
        pageName,
        path,
        metaTitle,
        slug: path.replace(/^\//, '') || 'home',
        status: 'PUBLISHED',
      })),
      skipDuplicates: true,
    });
    return this.prisma.seoPageSetting.findMany({ orderBy: { path: 'asc' } });
  }

  async getSeoPage(id: string) {
    const page = await this.prisma.seoPageSetting.findUnique({ where: { id } });
    if (!page) throw new NotFoundException('SEO page not found');
    return page;
  }

  async getPublicSeoByPath(path: string) {
    return this.prisma.seoPageSetting.findFirst({
      where: { path, status: 'PUBLISHED' },
    });
  }

  async resetSeoPage(id: string) {
    const page = await this.getSeoPage(id);
    return this.prisma.seoPageSetting.update({
      where: { id },
      data: {
        metaTitle: page.pageName,
        metaDescription: null,
        metaKeywords: [],
        canonicalUrl: null,
        ogTitle: null,
        ogDescription: null,
        ogImageUrl: null,
      },
    });
  }

  async updateSeoPage(
    id: string,
    data: Partial<{
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
    return this.prisma.seoPageSetting.update({ where: { id }, data: data as never });
  }

  async getGlobalSeo() {
    const settings = await this.prisma.siteSettings.findUnique({ where: { id: 'default' } });
    const siteUrl = settings?.siteUrl ?? 'https://drinsight.org';
    const defaultRobots =
      'User-agent: *\nAllow: /\nSitemap: ' +
      (settings?.xmlSitemapUrl ?? `${siteUrl.replace(/\/+$/, '')}/sitemap.xml`);
    const defaultSchema = {
      '@context': 'https://schema.org',
      '@type': 'MedicalOrganization',
      name: settings?.siteName ?? 'The Dr Insight',
      url: siteUrl.replace(/\/+$/, '') || 'https://www.drinsight.org',
    };
    return {
      siteTitle: settings?.siteTitle ?? settings?.siteName ?? 'The Dr Insight — Trusted, Doctor-Reviewed Medical Information',
      defaultMetaTitleSuffix: settings?.defaultMetaTitleSuffix ?? ' | DrInsight',
      defaultMetaDescription:
        settings?.defaultMetaDescription ??
        'Evidence-based medical information reviewed by board-certified physicians.',
      defaultMetaKeywords: settings?.defaultMetaKeywords ?? 'health, doctor, medical advice',
      ogTitle: settings?.ogTitle ?? '',
      ogDescription: settings?.ogDescription ?? '',
      twitterHandle: settings?.twitterHandle ?? '@drinsight',
      globalSchemaJson: settings?.globalSchemaJson ?? defaultSchema,
      googleSearchConsole: settings?.googleSearchConsole ?? '',
      googleAnalyticsId: settings?.googleAnalyticsId ?? '',
      xmlSitemapUrl: settings?.xmlSitemapUrl ?? `${siteUrl.replace(/\/+$/, '')}/sitemap.xml`,
      robotsTxt: settings?.robotsTxt ?? defaultRobots,
      sitemapXml: settings?.sitemapXml ?? (await this.generateSitemapXml()),
      siteUrl,
      faviconUrl: settings?.faviconUrl ?? '',
      socialSharingImageUrl: settings?.socialSharingImageUrl ?? '',
    };
  }

  async updateGlobalSeo(data: {
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
  }) {
    return this.prisma.siteSettings.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        contactPhone: '',
        contactEmail: '',
        ...data,
      },
      update: data,
    });
  }

  async generateSitemapXml() {
    const settings = await this.prisma.siteSettings.findUnique({ where: { id: 'default' } });
    const base = (settings?.siteUrl ?? 'https://drinsight.org').replace(/\/+$/, '');
    const today = new Date().toISOString().slice(0, 10);
    const pages = await this.listSeoPages();
    const urls = pages.map((p) => {
      const path = p.path === '/' ? '/' : p.path;
      const priority = p.sitemapPriority ?? (p.path === '/' ? 1.0 : p.path === '/blog' || p.path === '/doctors' ? 0.9 : 0.7);
      return `  <url><loc>${base}${path === '/' ? '/' : path}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${priority.toFixed(1)}</priority></url>`;
    });
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
  }

  async regenerateSitemapXml() {
    const xml = await this.generateSitemapXml();
    await this.updateGlobalSeo({ sitemapXml: xml });
    return { sitemapXml: xml };
  }

  buildPageSchema(page: {
    pageName: string;
    metaTitle: string;
    metaDescription?: string | null;
    canonicalUrl?: string | null;
    metaKeywords?: string[];
    path: string;
  }, siteUrl = 'https://drinsight.org') {
    const url = page.canonicalUrl || `${siteUrl.replace(/\/+$/, '')}${page.path === '/' ? '/' : page.path}`;
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      name: page.metaTitle || page.pageName,
      url,
      description: page.metaDescription ?? '',
      keywords: page.metaKeywords ?? [],
      isPartOf: { '@type': 'WebSite', name: 'The Dr Insight', url: siteUrl },
      publisher: { '@type': 'MedicalOrganization', name: 'The Dr Insight' },
    };
  }

  // CMS pages (editorial policy, author guidelines)
  async getCmsPage(slug: string) {
    let page = await this.prisma.cmsPage.findUnique({
      where: { slug },
      include: { sections: { orderBy: { displayOrder: 'asc' } } },
    });
    if (!page) {
      const defaults: Record<string, { title: string; heroSubtitle: string }> = {
        'editorial-policy': {
          title: 'Editorial Policy',
          heroSubtitle:
            'DrInsight is committed to providing accurate, evidence-based medical information reviewed by licensed healthcare professionals.',
        },
        'author-guidelines': {
          title: 'Author Guidelines',
          heroSubtitle:
            'Everything you need to know about writing for DrInsight — from qualification standards and submission requirements to style guides and editorial standards.',
        },
      };
      const fallback = defaults[slug];
      if (!fallback) throw new NotFoundException(`CMS page "${slug}" not found`);
      page = await this.prisma.cmsPage.create({
        data: {
          slug,
          title: fallback.title,
          heroSubtitle: fallback.heroSubtitle,
          version: '1.0',
          lastUpdated: new Date(),
        },
        include: { sections: { orderBy: { displayOrder: 'asc' } } },
      });
    }
    return page;
  }

  async updateCmsPage(
    slug: string,
    data: {
      title?: string;
      heroSubtitle?: string;
      lastUpdated?: string;
      version?: string;
      extra?: object;
    },
  ) {
    return this.prisma.cmsPage.update({
      where: { slug },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.heroSubtitle !== undefined && { heroSubtitle: data.heroSubtitle }),
        ...(data.lastUpdated !== undefined && { lastUpdated: new Date(data.lastUpdated) }),
        ...(data.version !== undefined && { version: data.version }),
        ...(data.extra !== undefined && { extra: data.extra }),
      },
      include: { sections: { orderBy: { displayOrder: 'asc' } } },
    });
  }

  async createCmsSection(pageSlug: string, data: { title: string; contentHtml?: string }) {
    const page = await this.getCmsPage(pageSlug);
    const maxOrder = await this.prisma.cmsPageSection.aggregate({
      where: { pageId: page.id },
      _max: { displayOrder: true },
    });
    return this.prisma.cmsPageSection.create({
      data: {
        pageId: page.id,
        title: data.title,
        contentHtml: data.contentHtml ?? '',
        displayOrder: (maxOrder._max.displayOrder ?? 0) + 1,
      },
    });
  }

  async updateCmsSection(
    id: string,
    data: Partial<{ title: string; contentHtml: string; isVisible: boolean; displayOrder: number }>,
  ) {
    return this.prisma.cmsPageSection.update({ where: { id }, data });
  }

  // Health tools
  private async seedHealthToolsIfEmpty() {
    const count = await this.prisma.healthTool.count();
    if (count > 0) return;
    const tools = [
      ['bmi', '⚖️', 'BMI Calculator', 'Body Mass Index assessment', 'Body & Weight', '/health-tools#bmi'],
      ['bmr', '🔥', 'BMR Calculator', 'Basal metabolic rate calculator', 'Body & Weight', '/health-tools#bmr'],
      ['heart-risk', '❤️', 'Heart Risk Calculator', '10-year cardiovascular risk score', 'Heart & Blood', '/health-tools#heartrate'],
      ['diabetes', '🩸', 'Diabetes Risk Assessment', 'Type 2 diabetes risk screener', 'Risk Assessment', '/health-tools#diabetes'],
      ['phq9', '🧠', 'PHQ-9 Depression Screener', 'Mental health screening tool', 'Mental Health', '/health-tools#mentalhealth'],
      ['kidney', '🫘', 'eGFR / Kidney Function', 'Kidney function estimator', 'Risk Assessment', '/health-tools#kidney'],
      ['blood-pressure', '💓', 'Blood Pressure Tracker', 'Log and trend BP readings', 'Heart & Blood', '/health-tools#bloodpressure'],
      ['calories', '🍽️', 'Calorie Calculator', 'Daily calorie needs estimator', 'Nutrition', '/health-tools#calories'],
      ['water', '💧', 'Water Intake Calculator', 'Optimal daily hydration', 'Nutrition', '/health-tools#water'],
      ['pregnancy', '🤰', 'Pregnancy Due Date Calculator', 'Estimated due date from LMP', "Women's Health", '/health-tools#pregnancy'],
      ['ovulation', '🌸', 'Ovulation Calculator', 'Fertile window predictor', "Women's Health", '/health-tools#ovulation'],
      ['symptom', '🔎', 'Symptom Checker', 'Guidance on possible conditions', 'Risk Assessment', '/health-tools#symptom'],
    ];
    await this.prisma.healthTool.createMany({
      data: tools.map(([slug, icon, name, description, category, route], index) => ({
        slug,
        iconEmoji: icon,
        name,
        description,
        category,
        route,
        displayOrder: index + 1,
        isActive: true,
        featured: index < 4,
      })),
    });
  }

  async listHealthTools(query?: { search?: string; category?: string; activeOnly?: boolean }) {
    await this.seedHealthToolsIfEmpty();
    const where = {
      ...(query?.category && { category: query.category }),
      ...(query?.activeOnly && { isActive: true }),
      ...(query?.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' as const } },
          { description: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };
    const tools = await this.prisma.healthTool.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
    });
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const usageCounts = await this.prisma.healthToolUsage.groupBy({
      by: ['toolId'],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { _all: true },
    });
    const usageMap = new Map(usageCounts.map((u) => [u.toolId, u._count._all]));
    return tools.map((tool) => ({
      ...tool,
      usageLast30Days: usageMap.get(tool.id) ?? tool.usageCount,
    }));
  }

  async listPublicHealthTools() {
    return this.listHealthTools({ activeOnly: true });
  }

  async getHealthTool(id: string) {
    const tool = await this.prisma.healthTool.findUnique({ where: { id } });
    if (!tool) throw new NotFoundException('Health tool not found');
    return tool;
  }

  async deleteHealthTool(id: string) {
    return this.prisma.healthTool.delete({ where: { id } });
  }

  async reorderHealthTools(items: Array<{ id: string; displayOrder: number }>) {
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.healthTool.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        }),
      ),
    );
    return this.listHealthTools();
  }

  async trackHealthToolUsage(slug: string, sessionId?: string) {
    const tool = await this.prisma.healthTool.findUnique({ where: { slug } });
    if (!tool || !tool.isActive) return { tracked: false };
    await this.prisma.$transaction([
      this.prisma.healthToolUsage.create({ data: { toolId: tool.id, sessionId } }),
      this.prisma.healthTool.update({
        where: { id: tool.id },
        data: { usageCount: { increment: 1 } },
      }),
    ]);
    return { tracked: true };
  }

  async createHealthTool(data: {
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
  }) {
    const maxOrder = await this.prisma.healthTool.aggregate({ _max: { displayOrder: true } });
    return this.prisma.healthTool.create({
      data: {
        ...data,
        displayOrder: (maxOrder._max.displayOrder ?? 0) + 1,
        isActive: data.isActive ?? true,
      },
    });
  }

  async updateHealthTool(
    id: string,
    data: Partial<{
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
    return this.prisma.healthTool.update({ where: { id }, data });
  }

  // Review process
  async getReviewProcess() {
    const [settings, schedules, tier1, tier2, tier3] = await Promise.all([
      this.prisma.reviewProcessSettings.findUnique({ where: { id: 'default' } }),
      this.prisma.contentCurrencySchedule.findMany({ orderBy: { displayOrder: 'asc' } }),
      this.prisma.doctorProfile.count({
        where: { user: { status: UserStatus.ACTIVE, role: UserRole.DOCTOR }, experienceYears: { gte: 5 } },
      }),
      this.prisma.doctorProfile.count({
        where: { user: { status: UserStatus.ACTIVE, role: UserRole.DOCTOR }, experienceYears: { gte: 7 } },
      }),
      this.prisma.doctorProfile.count({
        where: {
          user: { status: UserStatus.ACTIVE, role: UserRole.DOCTOR },
          OR: [{ editorialBoard: true }, { medicalReviewerFor: { not: null } }],
        },
      }),
    ]);

    return {
      settings: settings ?? {
        id: 'default',
        tier1MinYears: 5,
        tier2MinYears: 7,
        reviewDeadlineDays: 7,
        maxRevisionCycles: 2,
        authorRevisionWindowDays: 5,
        minSourcesPerArticle: 5,
        updatedAt: new Date(),
      },
      schedules,
      reviewerPool: {
        tier1,
        tier2,
        tier3,
      },
    };
  }

  async updateReviewProcess(data: {
    tier1MinYears?: number;
    tier2MinYears?: number;
    reviewDeadlineDays?: number;
    maxRevisionCycles?: number;
    authorRevisionWindowDays?: number;
    minSourcesPerArticle?: number;
  }) {
    return this.prisma.reviewProcessSettings.upsert({
      where: { id: 'default' },
      create: { id: 'default', ...data },
      update: data,
    });
  }

  async updateContentCurrencySchedule(id: string, reviewCycleMonths: number) {
    return this.prisma.contentCurrencySchedule.update({
      where: { id },
      data: { reviewCycleMonths },
    });
  }

  // Roles & permissions
  async getRolesMatrix() {
    const [roles, permissions] = await Promise.all([
      this.prisma.adminRole.findMany({
        include: { permissions: true },
        orderBy: { displayOrder: 'asc' },
      }),
      this.prisma.adminPermission.findMany({ orderBy: { displayOrder: 'asc' } }),
    ]);

    if (roles.length === 0) {
      await this.bootstrapRolesAndPermissions();
      const [bootRoles, bootPermissions] = await Promise.all([
        this.prisma.adminRole.findMany({
          include: { permissions: true },
          orderBy: { displayOrder: 'asc' },
        }),
        this.prisma.adminPermission.findMany({ orderBy: { displayOrder: 'asc' } }),
      ]);
      return { roles: bootRoles, permissions: bootPermissions };
    }

    return { roles, permissions };
  }

  private async bootstrapRolesAndPermissions() {
    const roleDefs = [
      { key: 'super_admin', name: 'Super Admin', description: 'Full unrestricted access to all modules', order: 0 },
      { key: 'editorial_admin', name: 'Editorial Admin', description: 'Manages content, review queue & editorial pages', order: 1 },
      { key: 'support_admin', name: 'Support Admin', description: 'Handles users, inquiries & prescriptions', order: 2 },
      { key: 'doctor', name: 'Doctor', description: 'Access to own dashboard, patients & articles', order: 3 },
      { key: 'patient', name: 'Patient', description: 'Access to own dashboard & health records', order: 4 },
    ];
    const permDefs = [
      'Manage Users',
      'Manage Doctors',
      'Manage Content',
      'Review Articles',
      'Manage Settings',
      'View Analytics',
      'Manage Payments',
      'Manage Notifications',
    ].map((name, index) => ({
      key: name.toLowerCase().replace(/\s+/g, '_'),
      name,
      order: index + 1,
    }));

    for (const role of roleDefs) {
      await this.prisma.adminRole.upsert({
        where: { key: role.key },
        create: { key: role.key, name: role.name, description: role.description, displayOrder: role.order },
        update: { name: role.name, description: role.description, displayOrder: role.order },
      });
    }

    for (const perm of permDefs) {
      await this.prisma.adminPermission.upsert({
        where: { key: perm.key },
        create: { key: perm.key, name: perm.name, displayOrder: perm.order },
        update: { name: perm.name, displayOrder: perm.order },
      });
    }

    const roles = await this.prisma.adminRole.findMany();
    const permissions = await this.prisma.adminPermission.findMany();
    const matrix: Record<string, string[]> = {
      super_admin: permissions.map((p) => p.key),
      editorial_admin: ['manage_content', 'review_articles', 'manage_settings', 'view_analytics', 'manage_notifications'],
      support_admin: ['manage_users', 'manage_doctors', 'review_articles', 'manage_payments'],
      doctor: ['review_articles'],
      patient: [],
    };

    for (const role of roles) {
      const enabled = new Set(matrix[role.key] ?? []);
      for (const permission of permissions) {
        await this.prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
          create: { roleId: role.id, permissionId: permission.id, enabled: enabled.has(permission.key) },
          update: { enabled: enabled.has(permission.key) },
        });
      }
    }
  }

  async updateRolePermission(roleId: string, permissionId: string, enabled: boolean) {
    return this.prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId, permissionId } },
      create: { roleId, permissionId, enabled },
      update: { enabled },
    });
  }
}
