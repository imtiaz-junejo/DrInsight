import { PrismaClient } from '@prisma/client';

const DEFAULT_PARTNERS = [
  { companyName: 'PharmaCare', description: 'Pharmaceutical Partner', websiteUrl: 'https://pharmacare.example.com', displayOrder: 1 },
  { companyName: 'BioResearch Labs', description: 'Research Institution', websiteUrl: 'https://bioresearch.example.com', displayOrder: 2 },
  { companyName: 'DiagnoScan', description: 'Diagnostics Provider', websiteUrl: 'https://diagnoscan.example.com', displayOrder: 3 },
  { companyName: 'GlobalHealth Network', description: 'Hospital Network', websiteUrl: 'https://globalhealth.example.com', displayOrder: 4 },
  { companyName: 'MedAI Solutions', description: 'Health Technology', websiteUrl: 'https://medai.example.com', displayOrder: 5 },
  { companyName: 'HealthShield', description: 'Insurance Partner', websiteUrl: 'https://healthshield.example.com', displayOrder: 6 },
];

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
  const existingPartners = await prisma.trustedPartner.count();
  if (existingPartners === 0) {
    await prisma.trustedPartner.createMany({ data: DEFAULT_PARTNERS });
  }

  await prisma.founderMessage.upsert({
    where: { id: 'default' },
    create: { id: 'default', ...DEFAULT_FOUNDER_MESSAGE },
    update: {},
  });
}
