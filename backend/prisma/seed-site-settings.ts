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
  return prisma.siteSettings.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      contactPhone: '+92 335 354 5545',
      contactEmail: 'contact@drinsight.org',
      contactWhatsapp: '+92 335 354 5545',
      addressLine1: 'Suite 400, Medical Plaza',
      addressLine2: 'Clifton Block 5',
      city: 'Karachi',
      country: 'Pakistan',
      businessHours: DEFAULT_HOURS,
    },
    update: {
      contactPhone: '+92 335 354 5545',
      contactEmail: 'contact@drinsight.org',
      contactWhatsapp: '+92 335 354 5545',
      addressLine1: 'Suite 400, Medical Plaza',
      addressLine2: 'Clifton Block 5',
      city: 'Karachi',
      country: 'Pakistan',
      businessHours: DEFAULT_HOURS,
    },
  });
}
