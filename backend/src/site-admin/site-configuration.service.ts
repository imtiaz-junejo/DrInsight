import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  decryptSecretJson,
  encryptSecretJson,
  maskSecret,
  SECRET_MASK,
} from '../common/utils/secret-crypto.util';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { NewsletterService } from '../newsletter/newsletter.service';
import { SiteCmsService } from './site-cms.service';
import {
  AdvertisementSettings,
  DEFAULT_FOOTER_MENU,
  DEFAULT_HEADER_MENU,
  IntegrationSecrets,
  MenuItem,
  normalizeMenuItems,
  pageHeroMap,
  SocialLinks,
} from './site-configuration.types';

const DEFAULT_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'MedicalOrganization',
  name: 'The Dr Insight',
  url: 'https://www.drinsight.org',
};

@Injectable()
export class SiteConfigurationService {
  constructor(
    private prisma: PrismaService,
    private siteCmsService: SiteCmsService,
    private newsletterService: NewsletterService,
    private auditLogService: AuditLogService,
  ) {}

  private async ensureSettings() {
    let settings = await this.prisma.siteSettings.findUnique({ where: { id: 'default' } });
    if (!settings) {
      settings = await this.prisma.siteSettings.create({
        data: {
          id: 'default',
          contactPhone: '',
          contactEmail: '',
          headerMenu: DEFAULT_HEADER_MENU as unknown as Prisma.InputJsonValue,
          footerMenu: DEFAULT_FOOTER_MENU as unknown as Prisma.InputJsonValue,
        },
      });
    }
    return settings;
  }

  private readSecrets(settings: { integrationSecrets?: string | null }): IntegrationSecrets {
    return decryptSecretJson<IntegrationSecrets>(settings.integrationSecrets);
  }

  private mergeSecrets(
    current: IntegrationSecrets,
    patch: Partial<IntegrationSecrets> & Record<string, string | undefined>,
  ): IntegrationSecrets {
    const next = { ...current };
    const secretKeys: Array<keyof IntegrationSecrets> = [
      'smtpPassword',
      'emailJsServiceId',
      'emailJsTemplateId',
      'emailJsPublicKey',
      'smsApiKey',
    ];
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined) continue;
      if (secretKeys.includes(key as keyof IntegrationSecrets) && value === SECRET_MASK) continue;
      (next as Record<string, unknown>)[key] = value;
    }
    return next;
  }

  async getBranding() {
    const s = await this.ensureSettings();
    const pageHeroes = pageHeroMap(s.pageHeroImages);
    const media = await this.prisma.siteMediaAsset.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return {
      logoUrl: s.logoUrl ?? '',
      faviconUrl: s.faviconUrl ?? '',
      footerLogoUrl: s.footerLogoUrl ?? '',
      heroImageUrl: s.heroImageUrl ?? '',
      wordmarkText: s.wordmarkText ?? 'The Dr Insight',
      tagline: s.tagline ?? 'Trusted, Doctor-Reviewed Medical Information',
      pageHeroImages: pageHeroes,
      media,
    };
  }

  async updateBranding(data: {
    logoUrl?: string;
    faviconUrl?: string;
    footerLogoUrl?: string;
    heroImageUrl?: string;
    wordmarkText?: string;
    tagline?: string;
  }) {
    const urls = [data.logoUrl, data.faviconUrl, data.footerLogoUrl, data.heroImageUrl].filter(Boolean);
    await this.trackMediaFromUrls(urls as string[]);
    return this.prisma.siteSettings.upsert({
      where: { id: 'default' },
      create: { id: 'default', contactPhone: '', contactEmail: '', ...data },
      update: data,
    });
  }

  async setPageHero(pageId: string, imageUrl: string | null) {
    const s = await this.ensureSettings();
    const heroes = pageHeroMap(s.pageHeroImages);
    if (imageUrl) {
      heroes[pageId] = imageUrl;
      await this.trackMediaFromUrls([imageUrl]);
    } else {
      delete heroes[pageId];
    }
    return this.prisma.siteSettings.update({
      where: { id: 'default' },
      data: { pageHeroImages: heroes as unknown as Prisma.InputJsonValue },
    });
  }

  async deleteMediaAsset(id: string) {
    const asset = await this.prisma.siteMediaAsset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Media asset not found');
    await this.prisma.siteMediaAsset.delete({ where: { id } });
    return { ok: true };
  }

  private async trackMediaFromUrls(urls: string[]) {
    for (const url of urls) {
      if (!url?.trim()) continue;
      const existing = await this.prisma.siteMediaAsset.findFirst({ where: { url } });
      if (!existing) {
        await this.prisma.siteMediaAsset.create({ data: { url } });
      }
    }
  }

  async getMenus() {
    const s = await this.ensureSettings();
    return {
      header: normalizeMenuItems(s.headerMenu, DEFAULT_HEADER_MENU),
      footer: normalizeMenuItems(s.footerMenu, DEFAULT_FOOTER_MENU),
    };
  }

  async updateMenus(data: { header?: MenuItem[]; footer?: MenuItem[] }) {
    const current = await this.getMenus();
    const header = data.header ?? current.header;
    const footer = data.footer ?? current.footer;
    this.validateMenuItems(header);
    this.validateMenuItems(footer);
    return this.prisma.siteSettings.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        contactPhone: '',
        contactEmail: '',
        headerMenu: header as unknown as Prisma.InputJsonValue,
        footerMenu: footer as unknown as Prisma.InputJsonValue,
      },
      update: {
        headerMenu: header as unknown as Prisma.InputJsonValue,
        footerMenu: footer as unknown as Prisma.InputJsonValue,
      },
    });
  }

  private validateMenuItems(items: MenuItem[]) {
    for (const item of items) {
      if (!item.label?.trim() || !item.href?.trim()) {
        throw new BadRequestException('Each menu item requires a label and URL');
      }
    }
  }

  async getContactDetails() {
    const s = await this.ensureSettings();
    const addressParts = [s.addressLine1, s.addressLine2, s.city, s.country].filter(Boolean);
    return {
      phone: s.contactPhone ?? '',
      whatsapp: s.contactWhatsapp ?? '',
      email: s.contactEmail ?? '',
      hours: s.officeHoursText ?? this.formatBusinessHours(s.businessHours),
      address: addressParts.join(', '),
      addressLine1: s.addressLine1 ?? '',
      addressLine2: s.addressLine2 ?? '',
      city: s.city ?? '',
      country: s.country ?? '',
      businessHours: s.businessHours,
      map: s.mapsUrl ?? '',
    };
  }

  private formatBusinessHours(raw: unknown): string {
    if (!Array.isArray(raw)) return 'Mon–Fri: 8AM–8PM | Sat: 9AM–5PM';
    const open = raw
      .filter((d) => d && typeof d === 'object' && !(d as { closed?: boolean }).closed)
      .map((d) => {
        const day = (d as { day?: string }).day ?? '';
        const hours = (d as { hours?: string }).hours ?? '';
        return day && hours ? `${day}: ${hours}` : '';
      })
      .filter(Boolean);
    return open.length ? open.join(' | ') : 'Mon–Fri: 8AM–8PM | Sat: 9AM–5PM';
  }

  async updateContactDetails(data: {
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
  }) {
    const patch: Prisma.SiteSettingsUpdateInput = {};
    if (data.phone !== undefined) patch.contactPhone = data.phone;
    if (data.whatsapp !== undefined) patch.contactWhatsapp = data.whatsapp;
    if (data.email !== undefined) patch.contactEmail = data.email;
    if (data.hours !== undefined) patch.officeHoursText = data.hours;
    if (data.map !== undefined) patch.mapsUrl = data.map;
    if (data.addressLine1 !== undefined) patch.addressLine1 = data.addressLine1;
    if (data.addressLine2 !== undefined) patch.addressLine2 = data.addressLine2;
    if (data.city !== undefined) patch.city = data.city;
    if (data.country !== undefined) patch.country = data.country;
    if (data.address !== undefined && data.addressLine1 === undefined) {
      patch.addressLine1 = data.address;
    }
    return this.prisma.siteSettings.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        contactPhone: data.phone ?? '',
        contactEmail: data.email ?? '',
        contactWhatsapp: data.whatsapp,
        officeHoursText: data.hours,
        mapsUrl: data.map,
        addressLine1: data.addressLine1 ?? data.address,
        addressLine2: data.addressLine2,
        city: data.city,
        country: data.country ?? 'Pakistan',
      },
      update: patch,
    });
  }

  async getAdvertisements(): Promise<AdvertisementSettings> {
    const s = await this.ensureSettings();
    const ads = (s.advertisements ?? {}) as AdvertisementSettings;
    return {
      adsense: ads.adsense ?? '',
      banner: ads.banner ?? '',
      sidebar: ads.sidebar ?? '',
      inarticle: ads.inarticle ?? '',
    };
  }

  async updateAdvertisements(data: AdvertisementSettings) {
    return this.prisma.siteSettings.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        contactPhone: '',
        contactEmail: '',
        advertisements: data as unknown as Prisma.InputJsonValue,
      },
      update: { advertisements: data as unknown as Prisma.InputJsonValue },
    });
  }

  async getGeneralSettings() {
    const s = await this.ensureSettings();
    const secrets = this.readSecrets(s);
    const social = (s.socialLinks ?? {}) as SocialLinks;
    return {
      siteName: s.siteName ?? 'The Dr Insight',
      siteUrl: s.siteUrl ?? 'https://drinsight.org',
      timezone: s.timezone ?? 'UTC',
      smtpHost: s.smtpHost ?? '',
      smtpFrom: s.smtpFrom ?? '',
      smtpPassword: maskSecret(secrets.smtpPassword),
      smtpPasswordConfigured: Boolean(secrets.smtpPassword),
      emailJsServiceId: secrets.emailJsServiceId ?? '',
      emailJsTemplateId: secrets.emailJsTemplateId ?? '',
      emailJsPublicKey: secrets.emailJsPublicKey ?? '',
      smsProvider: secrets.smsProvider ?? 'textbelt',
      smsApiKey: maskSecret(secrets.smsApiKey),
      smsApiKeyConfigured: Boolean(secrets.smsApiKey),
      smsCustomUrl: secrets.smsCustomUrl ?? '',
      smsSenderName: secrets.smsSenderName ?? 'DrInsight',
      smsTestNumber: secrets.smsTestNumber ?? '',
      socialLinks: {
        facebook: social.facebook ?? '',
        twitter: social.twitter ?? '',
        instagram: social.instagram ?? '',
        linkedin: social.linkedin ?? '',
        youtube: social.youtube ?? '',
      },
    };
  }

  async updateGeneralSettings(data: {
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
    socialLinks?: SocialLinks;
  }) {
    const s = await this.ensureSettings();
    const secrets = this.mergeSecrets(this.readSecrets(s), {
      smtpPassword: data.smtpPassword,
      emailJsServiceId: data.emailJsServiceId,
      emailJsTemplateId: data.emailJsTemplateId,
      emailJsPublicKey: data.emailJsPublicKey,
      smsProvider: data.smsProvider,
      smsApiKey: data.smsApiKey,
      smsCustomUrl: data.smsCustomUrl,
      smsSenderName: data.smsSenderName,
      smsTestNumber: data.smsTestNumber,
    });

    const patch: Prisma.SiteSettingsUpdateInput = {
      integrationSecrets: encryptSecretJson(secrets),
    };
    if (data.siteName !== undefined) patch.siteName = data.siteName;
    if (data.siteUrl !== undefined) patch.siteUrl = data.siteUrl;
    if (data.timezone !== undefined) patch.timezone = data.timezone;
    if (data.smtpHost !== undefined) patch.smtpHost = data.smtpHost;
    if (data.smtpFrom !== undefined) patch.smtpFrom = data.smtpFrom;
    if (data.socialLinks !== undefined) {
      patch.socialLinks = data.socialLinks as unknown as Prisma.InputJsonValue;
    }

    return this.prisma.siteSettings.update({ where: { id: 'default' }, data: patch });
  }

  async sendTestSmsOtp(phone: string) {
    const s = await this.ensureSettings();
    const secrets = this.readSecrets(s);
    if (!/^\+?[0-9 ()-]{7,18}$/.test(phone.trim())) {
      throw new BadRequestException('Enter a valid test cell number');
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const message = `${secrets.smsSenderName ?? 'DrInsight'} code: ${code} — valid 10 minutes. (test)`;
    const isCustom = secrets.smsProvider === 'custom' && secrets.smsCustomUrl;
    const url = isCustom ? secrets.smsCustomUrl! : 'https://textbelt.com/text';
    const body = isCustom
      ? { phone, message }
      : { phone, message, key: secrets.smsApiKey || 'textbelt' };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as { success?: boolean; ok?: boolean; error?: string };
    const ok = Boolean(data.success || data.ok);
    return {
      ok,
      message: ok ? `SMS code sent to ${phone}` : `SMS failed: ${data.error ?? 'check your key / quota'}`,
    };
  }

  async getSecuritySettings() {
    const s = await this.ensureSettings();
    return { requireTwoFactor: s.requireTwoFactor };
  }

  async updateSecuritySettings(data: { requireTwoFactor?: boolean }) {
    return this.prisma.siteSettings.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        contactPhone: '',
        contactEmail: '',
        requireTwoFactor: data.requireTwoFactor ?? false,
      },
      update: { requireTwoFactor: data.requireTwoFactor },
    });
  }

  async changeAdminPassword(userId: string, newPassword: string, confirmPassword: string) {
    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { ok: true, message: 'Password updated' };
  }

  async exportBackup() {
    const [branding, menus, contact, ads, general, security, globalSeo, seoPages, media, subscribers] =
      await Promise.all([
        this.getBranding(),
        this.getMenus(),
        this.getContactDetails(),
        this.getAdvertisements(),
        this.getGeneralSettings(),
        this.getSecuritySettings(),
        this.siteCmsService.getGlobalSeo(),
        this.siteCmsService.listSeoPages(),
        this.prisma.siteMediaAsset.findMany({ orderBy: { createdAt: 'desc' } }),
        this.newsletterService.listSubscribers({ page: 1, limit: 10000, status: 'all' }),
      ]);

    return {
      exportedAt: new Date().toISOString(),
      branding,
      menus,
      contact,
      advertisements: ads,
      settings: general,
      security,
      seo: globalSeo,
      pageSeo: seoPages,
      media,
      subscribers: subscribers.data,
    };
  }

  async restoreBackup(payload: Record<string, unknown>, actorUserId?: string) {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('Invalid backup file');
    }

    if (payload.branding && typeof payload.branding === 'object') {
      const b = payload.branding as Record<string, unknown>;
      await this.updateBranding({
        logoUrl: String(b.logoUrl ?? ''),
        faviconUrl: String(b.faviconUrl ?? ''),
        footerLogoUrl: String(b.footerLogoUrl ?? ''),
        heroImageUrl: String(b.heroImageUrl ?? ''),
        wordmarkText: String(b.wordmarkText ?? ''),
        tagline: String(b.tagline ?? ''),
      });
      const heroes = pageHeroMap(b.pageHeroImages);
      await this.prisma.siteSettings.update({
        where: { id: 'default' },
        data: { pageHeroImages: heroes as unknown as Prisma.InputJsonValue },
      });
    }

    if (payload.menus && typeof payload.menus === 'object') {
      const m = payload.menus as { header?: MenuItem[]; footer?: MenuItem[] };
      await this.updateMenus({ header: m.header, footer: m.footer });
    }

    if (payload.contact && typeof payload.contact === 'object') {
      const c = payload.contact as Record<string, string>;
      await this.updateContactDetails({
        phone: c.phone,
        whatsapp: c.whatsapp,
        email: c.email,
        hours: c.hours,
        address: c.address,
        map: c.map,
      });
    }

    if (payload.advertisements && typeof payload.advertisements === 'object') {
      await this.updateAdvertisements(payload.advertisements as AdvertisementSettings);
    }

    if (payload.settings && typeof payload.settings === 'object') {
      const s = payload.settings as Record<string, unknown>;
      await this.updateGeneralSettings({
        siteName: String(s.siteName ?? ''),
        siteUrl: String(s.siteUrl ?? ''),
        timezone: String(s.timezone ?? ''),
        smtpHost: String(s.smtpHost ?? ''),
        smtpFrom: String(s.smtpFrom ?? ''),
        socialLinks: (s.socialLinks as SocialLinks) ?? undefined,
      });
    }

    if (payload.security && typeof payload.security === 'object') {
      const sec = payload.security as { requireTwoFactor?: boolean };
      await this.updateSecuritySettings({ requireTwoFactor: sec.requireTwoFactor });
    }

    if (payload.seo && typeof payload.seo === 'object') {
      await this.siteCmsService.updateGlobalSeo(payload.seo as never);
    }

    await this.auditLogService.log({
      actorUserId: actorUserId ?? null,
      actorName: 'Admin',
      action: 'Configuration backup restored',
      target: 'site_settings',
      details: { keys: Object.keys(payload) },
    });

    return { ok: true };
  }

  async getPublicSiteConfig() {
    const s = await this.ensureSettings();
    const social = (s.socialLinks ?? {}) as SocialLinks;
    const ads = (s.advertisements ?? {}) as AdvertisementSettings;
    return {
      siteName: s.siteName ?? 'The Dr Insight',
      siteUrl: s.siteUrl ?? 'https://drinsight.org',
      tagline: s.tagline ?? '',
      wordmarkText: s.wordmarkText ?? '',
      logoUrl: s.logoUrl ?? '',
      footerLogoUrl: s.footerLogoUrl ?? '',
      faviconUrl: s.faviconUrl ?? '',
      heroImageUrl: s.heroImageUrl ?? '',
      headerMenu: normalizeMenuItems(s.headerMenu, DEFAULT_HEADER_MENU),
      footerMenu: normalizeMenuItems(s.footerMenu, DEFAULT_FOOTER_MENU),
      contact: await this.getContactDetails(),
      socialLinks: social,
      pageHeroImages: pageHeroMap(s.pageHeroImages),
      advertisements: {
        banner: ads.banner ?? '',
        sidebar: ads.sidebar ?? '',
        inarticle: ads.inarticle ?? '',
      },
    };
  }

  async getPublicAdvertisements() {
    const s = await this.ensureSettings();
    const ads = (s.advertisements ?? {}) as AdvertisementSettings;
    return {
      adsense: ads.adsense ?? '',
      banner: ads.banner ?? '',
      sidebar: ads.sidebar ?? '',
      inarticle: ads.inarticle ?? '',
    };
  }

  defaultGlobalSchema(siteUrl: string) {
    return { ...DEFAULT_SCHEMA, url: siteUrl.replace(/\/+$/, '') || DEFAULT_SCHEMA.url };
  }
}
