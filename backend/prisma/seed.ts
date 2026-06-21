import 'dotenv/config';
import { UserRole, BlogStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createPrismaClient } from '../src/prisma/create-prisma-client';

const prisma = createPrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@drinsight.com' },
    update: {},
    create: {
      email: 'admin@drinsight.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  const doctorUser = await prisma.user.upsert({
    where: { email: 'doctor@drinsight.com' },
    update: {},
    create: {
      email: 'doctor@drinsight.com',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Mitchell',
      role: UserRole.DOCTOR,
      status: 'ACTIVE',
      emailVerified: true,
      doctorProfile: {
        create: {
          specialty: 'Cardiology',
          licenseNumber: 'MD-123456',
          bio: 'Board-certified cardiologist with 15 years of experience.',
          experienceYears: 15,
          consultationFee: 150,
          rating: 4.9,
          reviewCount: 128,
          availability: 'AVAILABLE',
          languages: ['English', 'Spanish'],
          hospital: 'New York Medical Center',
        },
      },
    },
  });

  const patientUser = await prisma.user.upsert({
    where: { email: 'patient@drinsight.com' },
    update: {},
    create: {
      email: 'patient@drinsight.com',
      passwordHash,
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.PATIENT,
      status: 'ACTIVE',
      emailVerified: true,
      patientProfile: { create: {} },
    },
  });

  const cardiology = await prisma.blogCategory.upsert({
    where: { slug: 'cardiology' },
    update: {},
    create: { name: 'Cardiology', slug: 'cardiology', description: 'Heart health articles' },
  });

  await prisma.blogPost.upsert({
    where: { slug: '10-warning-signs-heart-disease' },
    update: {},
    create: {
      title: '10 Warning Signs of Heart Disease You Should Never Ignore',
      slug: '10-warning-signs-heart-disease',
      excerpt: 'Cardiologists reveal the subtle symptoms that often go unnoticed until it\'s too late.',
      content: '<p>Heart disease remains the leading cause of death worldwide...</p>',
      categoryId: cardiology.id,
      authorId: doctorUser.id,
      status: BlogStatus.PUBLISHED,
      readTimeMinutes: 5,
      tags: ['cardiology', 'heart-health'],
      publishedAt: new Date(),
    },
  });

  console.log('Seed completed:', { admin: admin.email, doctor: doctorUser.email, patient: patientUser.email });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
