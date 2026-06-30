import 'dotenv/config';
import { UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createPrismaClient } from '../src/prisma/create-prisma-client';

const prisma = createPrismaClient();

const DEMO_PASSWORD = 'Password123!';
const BCRYPT_ROUNDS = 12;

const DEMO_USERS = {
  admin: {
    email: 'admin@drinsight.com',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
  },
  doctor: {
    email: 'doctor@drinsight.com',
    firstName: 'Sarah',
    lastName: 'Mitchell',
    role: UserRole.DOCTOR,
    profile: {
      specialty: 'Cardiology',
      licenseNumber: 'MD-123456',
      bio: 'Board-certified cardiologist with 15 years of experience.',
      experienceYears: 15,
      consultationFee: 150,
      rating: 4.9,
      reviewCount: 128,
      availability: 'AVAILABLE' as const,
      languages: ['English', 'Spanish'],
      hospital: 'New York Medical Center',
    },
  },
  patient: {
    email: 'patient@drinsight.com',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.PATIENT,
  },
} as const;

function assertDevelopmentEnvironment() {
  const nodeEnv = process.env.NODE_ENV?.toLowerCase();
  if (nodeEnv === 'production') {
    console.error('Refusing to seed: NODE_ENV is production. Demo seed is for development only.');
    process.exit(1);
  }
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function seedDemoUser(
  email: string,
  firstName: string,
  lastName: string,
  role: UserRole,
  passwordHash: string,
) {
  return prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      firstName,
      lastName,
      role,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
    create: {
      email,
      passwordHash,
      firstName,
      lastName,
      role,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });
}

async function main() {
  assertDevelopmentEnvironment();

  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const admin = await seedDemoUser(
    DEMO_USERS.admin.email,
    DEMO_USERS.admin.firstName,
    DEMO_USERS.admin.lastName,
    DEMO_USERS.admin.role,
    passwordHash,
  );

  const doctorUser = await seedDemoUser(
    DEMO_USERS.doctor.email,
    DEMO_USERS.doctor.firstName,
    DEMO_USERS.doctor.lastName,
    DEMO_USERS.doctor.role,
    passwordHash,
  );

  await prisma.doctorProfile.upsert({
    where: { userId: doctorUser.id },
    update: DEMO_USERS.doctor.profile,
    create: {
      userId: doctorUser.id,
      ...DEMO_USERS.doctor.profile,
    },
  });

  const patientUser = await seedDemoUser(
    DEMO_USERS.patient.email,
    DEMO_USERS.patient.firstName,
    DEMO_USERS.patient.lastName,
    DEMO_USERS.patient.role,
    passwordHash,
  );

  await prisma.patientProfile.upsert({
    where: { userId: patientUser.id },
    update: {},
    create: { userId: patientUser.id },
  });

  console.log('Demo seed completed:', {
    admin: admin.email,
    doctor: doctorUser.email,
    patient: patientUser.email,
  });
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
