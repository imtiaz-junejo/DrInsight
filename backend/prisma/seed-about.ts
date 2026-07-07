import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { createPrismaClient } from '../src/prisma/create-prisma-client';

export const DEFAULT_PARTNERS = [
  { companyName: 'PharmaCare', description: 'pharma', websiteUrl: 'https://pharmacare.example.com', displayOrder: 1 },
  { companyName: 'BioResearch Labs', description: 'research', websiteUrl: 'https://bioresearch.example.com', displayOrder: 2 },
  { companyName: 'DiagnoScan', description: 'diagnostics', websiteUrl: 'https://diagnoscan.example.com', displayOrder: 3 },
  { companyName: 'GlobalHealth Network', description: 'hospital', websiteUrl: 'https://globalhealth.example.com', displayOrder: 4 },
  { companyName: 'MedAI Solutions', description: 'tech', websiteUrl: 'https://medai.example.com', displayOrder: 5 },
  { companyName: 'HealthShield', description: 'insurance', websiteUrl: 'https://healthshield.example.com', displayOrder: 6 },
  { companyName: 'WellnessFirst', description: 'wellness', websiteUrl: 'https://wellnessfirst.example.com', displayOrder: 7 },
  { companyName: 'TelemedConnect', description: 'tech', websiteUrl: 'https://telemedconnect.example.com', displayOrder: 8 },
  { companyName: 'GenomicsCo', description: 'research', websiteUrl: 'https://genomicsco.example.com', displayOrder: 9 },
  { companyName: 'CardioLink', description: 'hospital', websiteUrl: 'https://cardiolink.example.com', displayOrder: 10 },
  { companyName: 'VaxGlobal', description: 'pharma', websiteUrl: 'https://vaxglobal.example.com', displayOrder: 11 },
  { companyName: 'NeuroPath', description: 'diagnostics', websiteUrl: 'https://neuropath.example.com', displayOrder: 12 },
] as const;

const DEFAULT_FOUNDER_MESSAGE = {
  founderName: 'Dr. Javed Kumbhar',
  designation: 'Founder & Medical Director',
  headline: 'Building a Platform Where Every Patient Deserves the Truth',
  messageHtml: [
    '<p>When I began my medical career over two decades ago, I was struck by one consistent challenge: patients were leaving consultations confused, overwhelmed, or misinformed — not because their doctors lacked expertise, but because the healthcare system lacked accessibility and clarity.</p>',
    '<p>I founded <strong>DrInsight</strong> in 2018 with a simple conviction — that <strong>accurate, evidence-based medical information should be a right, not a privilege.</strong> Every person, regardless of their location, income, or background, deserves access to the kind of trusted guidance that only a good doctor can provide.</p>',
    '<p>What started as a small team of passionate physicians has grown into a platform trusted by patients worldwide. Our doctors don\'t just answer questions — they empower patients to make confident, informed decisions about their health. Every article is reviewed. Every tool is validated. Every consultation is held to the highest clinical standard.</p>',
    '<p>We are not just a website. We are a movement toward a healthier, better-informed world. And we are only just beginning.</p>',
  ].join('\n'),
  eyebrow: 'A Message from Our Founder',
  subline: 'DrInsight — Est. 2018',
  badgeText: '✓ Verified MD',
  credentials: [
    { icon: '🎓', text: 'MBBS, MD — Internal Medicine' },
    { icon: '🏥', text: '20+ Years Clinical Experience' },
    { icon: '📋', text: 'Board Certified — AMA & USMLE' },
    { icon: '🔬', text: 'Former Chief of Medicine, NYU' },
    { icon: '📚', text: '40+ Peer-Reviewed Publications' },
    { icon: '🌍', text: 'WHO Advisory Panel Member' },
  ],
  tags: ['Internal Medicine', 'Preventive Health', 'Digital Health', 'Medical Education'],
  signatureName: 'Dr. Javed Kumbhar',
  signatureTitle: 'MBBS, MD — Founder & Medical Director, DrInsight',
  locationLine: '📍 Karachi, Pakistan',
  isActive: true,
};

export async function seedAboutContent(prisma: PrismaClient) {
  let created = 0;
  let updated = 0;

  for (const partner of DEFAULT_PARTNERS) {
    const existing = await prisma.trustedPartner.findFirst({
      where: { companyName: partner.companyName },
    });

    if (existing) {
      await prisma.trustedPartner.update({
        where: { id: existing.id },
        data: {
          description: partner.description,
          websiteUrl: partner.websiteUrl,
          displayOrder: partner.displayOrder,
          isActive: true,
        },
      });
      updated += 1;
    } else {
      await prisma.trustedPartner.create({
        data: {
          ...partner,
          isActive: true,
        },
      });
      created += 1;
    }
  }

  await prisma.founderMessage.upsert({
    where: { id: 'default' },
    create: { id: 'default', ...DEFAULT_FOUNDER_MESSAGE },
    update: {},
  });

  return { partners: { created, updated, total: DEFAULT_PARTNERS.length } };
}

async function main() {
  const prisma = createPrismaClient();

  try {
    const result = await seedAboutContent(prisma);
    console.log('About content seed completed successfully.');
    console.log(result);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('About content seed failed:', error);
    process.exit(1);
  });
}
