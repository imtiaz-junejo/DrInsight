import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { createPrismaClient } from '../src/prisma/create-prisma-client';

const HOMEPAGE_SECTIONS = [
  { slug: 'hero-banner', title: 'Hero Banner' },
  { slug: 'trust-badges', title: 'Trust Badges Strip' },
  { slug: 'featured-specialties', title: 'Featured Specialties' },
  { slug: 'top-health-tools', title: 'Top Health Tools' },
  { slug: 'latest-articles', title: 'Latest Articles' },
  { slug: 'meet-doctors', title: 'Meet Our Doctors' },
  { slug: 'testimonials', title: 'Patient Testimonials' },
  { slug: 'newsletter', title: 'Newsletter Signup' },
  { slug: 'statistics', title: 'Statistics Counter' },
  { slug: 'app-download', title: 'App Download CTA' },
];

const SEO_PAGES = [
  {
    pageName: 'Homepage',
    path: '/',
    metaTitle: 'DrInsight — Trusted, Doctor-Reviewed Medical Information',
    metaDescription: 'Evidence-based medical information reviewed by board-certified physicians.',
  },
  {
    pageName: 'About Us',
    path: '/about',
    metaTitle: 'About DrInsight — Our Mission, Doctors & Editorial Standards',
    metaDescription: 'Learn about DrInsight, our mission, and our editorial standards.',
  },
  {
    pageName: 'Blog',
    path: '/blog',
    metaTitle: 'Medical Health Articles — Expert Doctor-Written Guides | DrInsight',
    metaDescription: 'Browse doctor-written medical articles and health guides.',
  },
  {
    pageName: 'Health Tools',
    path: '/health-tools',
    metaTitle: 'Free Health Tools & Medical Calculators | DrInsight',
    metaDescription: 'Free health calculators and medical assessment tools.',
  },
  {
    pageName: 'Book Consultation',
    path: '/book-consultation',
    metaTitle: 'Book an Online Doctor Consultation — Video, Phone or Chat | DrInsight',
    metaDescription: 'Book online doctor consultations by video, phone, or chat.',
  },
  {
    pageName: 'Ask a Doctor',
    path: '/ask-doctor',
    metaTitle: 'Ask a Doctor Online — Get Answers from Real Specialists | DrInsight',
    metaDescription: 'Ask medical questions and get answers from licensed specialists.',
  },
  {
    pageName: 'Editorial Policy',
    path: '/editorial-policy',
    metaTitle: 'Editorial Policy — How We Ensure Medical Accuracy | DrInsight',
    metaDescription: 'How DrInsight ensures medical accuracy and editorial integrity.',
  },
  {
    pageName: 'Author Guidelines',
    path: '/author-guidelines',
    metaTitle: 'Author Guidelines — Write Medical Articles for DrInsight',
    metaDescription: 'Guidelines for contributing medical articles to DrInsight.',
  },
];

const HEALTH_TOOLS = [
  { slug: 'bmi-calculator', name: 'BMI Calculator', description: 'Body Mass Index assessment', iconEmoji: '⚖️' },
  { slug: 'heart-risk', name: 'Heart Risk Calculator', description: '10-year cardiovascular risk score', iconEmoji: '❤️' },
  { slug: 'diabetes-risk', name: 'Diabetes Risk Assessment', description: 'Type 2 diabetes risk screener', iconEmoji: '🩸' },
  { slug: 'phq9', name: 'PHQ-9 Depression Screener', description: 'Mental health screening tool', iconEmoji: '🧠' },
  { slug: 'lung-age', name: 'Lung Age Calculator', description: 'Estimates lung age from spirometry', iconEmoji: '🫁' },
  { slug: 'bp-tracker', name: 'Blood Pressure Tracker', description: 'Log and trend BP readings', iconEmoji: '💓' },
  { slug: 'calorie-calculator', name: 'Calorie Calculator', description: 'Daily calorie needs estimator', iconEmoji: '🍽️' },
  { slug: 'egfr', name: 'eGFR / Kidney Function', description: 'Kidney function estimator', iconEmoji: '🫘' },
];

const FAQS = [
  {
    question: 'How does DrInsight review medical content?',
    answer: 'All medical content is reviewed by licensed physicians using our tiered editorial review process.',
    category: 'Editorial',
  },
  {
    question: 'How do I book a consultation?',
    answer: 'Visit the Book Consultation page, choose a doctor, and select your preferred time and consultation type.',
    category: 'Consultations',
  },
  {
    question: 'Is my health data secure?',
    answer: 'Yes. DrInsight uses encrypted connections and follows strict data protection practices.',
    category: 'Privacy & Security',
  },
  {
    question: 'How do I become a contributing author?',
    answer: 'Review our Author Guidelines and submit your credentials through the doctor registration flow.',
    category: 'Authors',
  },
  {
    question: 'Can I get a refund for a cancelled consultation?',
    answer: 'Refund eligibility depends on cancellation timing and payment status. Contact support for assistance.',
    category: 'Billing',
  },
  {
    question: 'How do I reset my password?',
    answer: 'Use the Forgot Password link on the login page to receive a secure reset email.',
    category: 'Account',
  },
];

const EDITORIAL_SECTIONS = [
  'Our Mission & Values',
  'Content Creation Process',
  'Medical Review Standards',
  'Sourcing & Citation Policy',
  'Conflict of Interest Disclosure',
  'Corrections & Updates Policy',
  'Advertising & Sponsorship Policy',
];

const AUTHOR_GUIDELINE_SECTIONS = [
  'Why Write for Us',
  'Who Can Contribute',
  'Qualification Standards',
  'Types of Content',
  'Pre-Submission Checklist',
  'Required Article Structure',
  'Writing Style Guide',
  'Evidence & Source Standards',
  'Submission Process',
  'Author Rights & Payments',
  'Conflict of Interest Policy',
];

const CONTENT_CURRENCY = [
  ['Drug & Medication Guides', 6],
  ['Clinical Overview Articles', 12],
  ['Oncology Content', 6],
  ['Mental Health Articles', 12],
  ['Pediatric Content', 12],
  ['Research Explainers', 24],
];

const ROLES = [
  { key: 'super_admin', name: 'Super Admin', description: 'Full unrestricted access to all modules', order: 0 },
  { key: 'editorial_admin', name: 'Editorial Admin', description: 'Manages content, review queue & editorial pages', order: 1 },
  { key: 'support_admin', name: 'Support Admin', description: 'Handles users, inquiries & prescriptions', order: 2 },
  { key: 'doctor', name: 'Doctor', description: 'Access to own dashboard, patients & articles', order: 3 },
  { key: 'patient', name: 'Patient', description: 'Access to own dashboard & health records', order: 4 },
];

const PERMISSIONS = [
  { key: 'manage_users', name: 'Manage Users' },
  { key: 'manage_doctors', name: 'Manage Doctors' },
  { key: 'manage_content', name: 'Manage Content' },
  { key: 'review_articles', name: 'Review Articles' },
  { key: 'manage_settings', name: 'Manage Settings' },
  { key: 'view_analytics', name: 'View Analytics' },
  { key: 'manage_payments', name: 'Manage Payments' },
  { key: 'manage_notifications', name: 'Manage Notifications' },
];

const DEFAULT_PERMISSION_MATRIX: Record<string, string[]> = {
  super_admin: PERMISSIONS.map((p) => p.key),
  editorial_admin: ['manage_content', 'review_articles', 'manage_settings', 'view_analytics', 'manage_notifications'],
  support_admin: ['manage_users', 'manage_doctors', 'review_articles', 'manage_payments'],
  doctor: ['review_articles'],
  patient: [],
};

export async function seedAdminCms(prisma: PrismaClient) {
  for (const [index, section] of HOMEPAGE_SECTIONS.entries()) {
    await prisma.homepageSection.upsert({
      where: { slug: section.slug },
      create: { slug: section.slug, title: section.title, displayOrder: index + 1, isVisible: true },
      update: { title: section.title, displayOrder: index + 1 },
    });
  }

  for (const page of SEO_PAGES) {
    await prisma.seoPageSetting.upsert({
      where: { path: page.path },
      create: page,
      update: { pageName: page.pageName, metaTitle: page.metaTitle, metaDescription: page.metaDescription },
    });
  }

  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      contactPhone: '+92 300 0000000',
      contactEmail: 'drinsightofficial@gmail.com',
      defaultMetaTitleSuffix: ' | DrInsight',
      defaultMetaDescription: 'Evidence-based medical information reviewed by board-certified physicians.',
      googleSearchConsole: 'Connected ✓',
      xmlSitemapUrl: 'https://drinsight.org/sitemap.xml',
    },
    update: {
      defaultMetaTitleSuffix: ' | DrInsight',
      defaultMetaDescription: 'Evidence-based medical information reviewed by board-certified physicians.',
      googleSearchConsole: 'Connected ✓',
      xmlSitemapUrl: 'https://drinsight.org/sitemap.xml',
    },
  });

  for (const [index, tool] of HEALTH_TOOLS.entries()) {
    await prisma.healthTool.upsert({
      where: { slug: tool.slug },
      create: { ...tool, displayOrder: index + 1, isActive: true },
      update: { name: tool.name, description: tool.description, iconEmoji: tool.iconEmoji, displayOrder: index + 1 },
    });
  }

  for (const [index, faq] of FAQS.entries()) {
    const existing = await prisma.faq.findFirst({ where: { question: faq.question } });
    if (existing) {
      await prisma.faq.update({
        where: { id: existing.id },
        data: { ...faq, displayOrder: index + 1, isActive: true },
      });
    } else {
      await prisma.faq.create({ data: { ...faq, displayOrder: index + 1, isActive: true } });
    }
  }

  const editorialPage = await prisma.cmsPage.upsert({
    where: { slug: 'editorial-policy' },
    create: {
      slug: 'editorial-policy',
      title: 'Editorial Policy',
      heroSubtitle:
        'DrInsight is committed to providing accurate, evidence-based medical information reviewed by licensed healthcare professionals.',
      lastUpdated: new Date('2026-06-01'),
      version: '2.1',
    },
    update: {},
  });

  for (const [index, title] of EDITORIAL_SECTIONS.entries()) {
    const existing = await prisma.cmsPageSection.findFirst({ where: { pageId: editorialPage.id, title } });
    if (!existing) {
      await prisma.cmsPageSection.create({
        data: { pageId: editorialPage.id, title, displayOrder: index + 1, isVisible: true, contentHtml: '' },
      });
    }
  }

  const authorPage = await prisma.cmsPage.upsert({
    where: { slug: 'author-guidelines' },
    create: {
      slug: 'author-guidelines',
      title: 'Author Guidelines',
      heroSubtitle:
        'Everything you need to know about writing for DrInsight — from qualification standards and submission requirements to style guides and editorial standards.',
      lastUpdated: new Date('2026-06-01'),
      version: '1.0',
      extra: { honorariumRate: '150 – 400' },
    },
    update: {},
  });

  for (const [index, title] of AUTHOR_GUIDELINE_SECTIONS.entries()) {
    const existing = await prisma.cmsPageSection.findFirst({ where: { pageId: authorPage.id, title } });
    if (!existing) {
      await prisma.cmsPageSection.create({
        data: { pageId: authorPage.id, title, displayOrder: index + 1, isVisible: true, contentHtml: '' },
      });
    }
  }

  await prisma.reviewProcessSettings.upsert({
    where: { id: 'default' },
    create: { id: 'default' },
    update: {},
  });

  for (const [index, [contentType, months]] of CONTENT_CURRENCY.entries()) {
    await prisma.contentCurrencySchedule.upsert({
      where: { contentType },
      create: { contentType, reviewCycleMonths: months, displayOrder: index + 1 },
      update: { reviewCycleMonths: months, displayOrder: index + 1 },
    });
  }

  const roleRecords = [];
  for (const role of ROLES) {
    const record = await prisma.adminRole.upsert({
      where: { key: role.key },
      create: {
        key: role.key,
        name: role.name,
        description: role.description,
        displayOrder: role.order,
      },
      update: { name: role.name, description: role.description, displayOrder: role.order },
    });
    roleRecords.push(record);
  }

  const permissionRecords = [];
  for (const [index, permission] of PERMISSIONS.entries()) {
    const record = await prisma.adminPermission.upsert({
      where: { key: permission.key },
      create: { key: permission.key, name: permission.name, displayOrder: index + 1 },
      update: { name: permission.name, displayOrder: index + 1 },
    });
    permissionRecords.push(record);
  }

  for (const role of roleRecords) {
    const enabledKeys = DEFAULT_PERMISSION_MATRIX[role.key] ?? [];
    for (const permission of permissionRecords) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        create: { roleId: role.id, permissionId: permission.id, enabled: enabledKeys.includes(permission.key) },
        update: { enabled: enabledKeys.includes(permission.key) },
      });
    }
  }

  const paths = ['/', '/blog', '/health-tools', '/book-consultation', '/ask-doctor', '/about'];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const existingViews = await prisma.pageView.count();
  if (existingViews === 0) {
    for (let day = 0; day < 30; day += 1) {
      for (const path of paths) {
        const createdAt = new Date(thirtyDaysAgo.getTime() + day * 24 * 60 * 60 * 1000);
        const count = 20 + (day % 7) * 5;
        for (let i = 0; i < count; i += 1) {
          await prisma.pageView.create({
            data: {
              path,
              sessionId: `seed-session-${day}-${i % 10}`,
              referrer: i % 3 === 0 ? 'https://google.com' : i % 3 === 1 ? null : 'https://facebook.com',
              durationSeconds: 120 + (i % 5) * 30,
              createdAt,
            },
          });
        }
      }
    }
  }
}

async function main() {
  const prisma = createPrismaClient();

  try {
    await seedAdminCms(prisma);
    console.log('Admin CMS seed completed successfully.');
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Admin CMS seed failed:', error);
    process.exit(1);
  });
}
