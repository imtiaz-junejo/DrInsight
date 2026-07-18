import { PrismaClient } from '@prisma/client';

const DEFAULT_HOURS = [
  { day: 'Monday', hours: '8:00 AM – 8:00 PM', closed: false },
  { day: 'Tuesday', hours: '8:00 AM – 8:00 PM', closed: false },
  { day: 'Wednesday', hours: '8:00 AM – 8:00 PM', closed: false },
  { day: 'Thursday', hours: '8:00 AM – 8:00 PM', closed: false },
  { day: 'Friday', hours: '8:00 AM – 6:00 PM', closed: false },
  { day: 'Saturday', hours: '9:00 AM – 5:00 PM', closed: false },
  { day: 'Sunday', hours: 'Closed', closed: true },
];

export async function seedSiteSettings(prisma: PrismaClient) {
  const headerMenu = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Health Tools', href: '/health-tools' },
    { label: 'Our Doctors', href: '/our-doctors' },
    { label: 'Ask the Doctor', href: '/ask-doctor' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ];
  const footerMenu = [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms-conditions' },
    { label: 'Medical Disclaimer', href: '/disclaimer' },
    { label: 'Cookie Policy', href: '/cookie-policy' },
    { label: 'Sitemap', href: '/sitemap' },
    { label: 'FAQ', href: '/faq' },
  ];

  return prisma.siteSettings.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      contactPhone: '+92 335 354 5545',
      contactEmail: 'drinsightofficial@gmail.com',
      contactWhatsapp: '+92 335 354 5545',
      addressLine1: 'Badin, Sindh Pakistan',
      addressLine2: '',
      city: '',
      country: '',
      businessHours: DEFAULT_HOURS,
      officeHoursText: 'Mon–Fri: 8AM–8PM | Sat: 9AM–5PM',
      siteName: 'The Dr Insight',
      wordmarkText: 'The Dr Insight',
      tagline: 'Trusted, Doctor-Reviewed Medical Information',
      headerMenu,
      footerMenu,
    },
    update: {
      contactPhone: '+92 335 354 5545',
      contactEmail: 'drinsightofficial@gmail.com',
      contactWhatsapp: '+92 335 354 5545',
      addressLine1: 'Badin, Sindh Pakistan',
      addressLine2: '',
      city: '',
      country: '',
      businessHours: DEFAULT_HOURS,
      officeHoursText: 'Mon–Fri: 8AM–8PM | Sat: 9AM–5PM',
      headerMenu,
      footerMenu,
    },
  });
}
