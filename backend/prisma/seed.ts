import 'dotenv/config';
import { randomBytes } from 'crypto';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createPrismaClient } from '../src/prisma/create-prisma-client';
import {
  ADMIN_COUNT,
  ALL_PAKISTANI_LANGUAGES,
  BLOOD_GROUPS,
  COMMON_ALLERGIES,
  DOCTOR_COUNT,
  GENDERS,
  LEGACY_DEMO_EMAILS,
  MEDICAL_HISTORY_SNIPPETS,
  MEDICAL_SPECIALTIES,
  PAKISTANI_CITIES,
  PAKISTANI_FIRST_NAMES_FEMALE,
  PAKISTANI_FIRST_NAMES_MALE,
  PAKISTANI_HOSPITALS,
  PAKISTANI_LAST_NAMES,
  PAKISTANI_MEDICAL_UNIVERSITIES,
  PATIENT_COUNT,
  SEED_DOMAIN,
  SEED_PASSWORD,
  avatarUrl,
  buildDoctorBioProfile,
  consultationFeePkr,
  dateOfBirth,
  doctorAvailability,
  doctorBio,
  doctorStatus,
  emergencyContact,
  lastSeenAt,
  pakistaniPhone,
  patientStatus,
  pick,
  pickMany,
  pmdcLicenseNumber,
  seedEmail,
} from './seed-data';
import { seedContentPhase } from './seed-content';
import { seedFinalizePhase } from './seed-finalize';
import { seedOperationalPhase } from './seed-operational';
import { seedSiteSettings } from './seed-site-settings';
import { seedAboutContent } from './seed-about';
import { seedPublications } from './seed-publications';
import { seedAdminCms } from './seed-admin-cms';
import { assertDevelopmentEnvironment } from './seed-shared';

const prisma = createPrismaClient();
const BCRYPT_ROUNDS = 12;

type SeedUserInput = {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  phone: string;
  avatarUrl: string;
  emailVerified: boolean;
  lastSeenAt: Date | null;
  isOnline: boolean;
};

type EnsureStats = {
  created: number;
  skipped: number;
};

function seedIndexFromEmail(email: string, role: UserRole): number {
  const prefix =
    role === UserRole.ADMIN ? 'admin' : role === UserRole.DOCTOR ? 'doctor' : 'patient';
  const match = email.match(new RegExp(`^${prefix}(\\d+)@`, 'i'));
  return match ? Number.parseInt(match[1]!, 10) : 1;
}

function logRoleCounts(users: Array<{ role: UserRole }>) {
  const admins = users.filter((user) => user.role === UserRole.ADMIN).length;
  const doctors = users.filter((user) => user.role === UserRole.DOCTOR).length;
  const patients = users.filter((user) => user.role === UserRole.PATIENT).length;
  console.log(`✓ Existing admins found: ${admins}`);
  console.log(`✓ Existing doctors found: ${doctors}`);
  console.log(`✓ Existing patients found: ${patients}`);
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

function personName(index: number, role: UserRole): { firstName: string; lastName: string; gender: string } {
  const isFemale =
    role === UserRole.ADMIN
      ? index % 3 === 0
      : role === UserRole.DOCTOR
        ? index % 4 === 0
        : index % 2 === 0;
  const firstName = isFemale
    ? pick(PAKISTANI_FIRST_NAMES_FEMALE, index)
    : pick(PAKISTANI_FIRST_NAMES_MALE, index);
  const lastName = pick(PAKISTANI_LAST_NAMES, index + role.length);
  return { firstName, lastName, gender: isFemale ? 'Female' : 'Male' };
}

function buildSeedUsers(): SeedUserInput[] {
  const users: SeedUserInput[] = [];

  for (let i = 1; i <= ADMIN_COUNT; i++) {
    const { firstName, lastName } = personName(i, UserRole.ADMIN);
    users.push({
      email: seedEmail(UserRole.ADMIN, i),
      firstName,
      lastName,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      phone: pakistaniPhone(i),
      avatarUrl: avatarUrl(firstName, lastName),
      emailVerified: true,
      lastSeenAt: lastSeenAt(i),
      isOnline: i % 3 === 0,
    });
  }

  for (let i = 1; i <= DOCTOR_COUNT; i++) {
    const { firstName, lastName } = personName(i + 100, UserRole.DOCTOR);
    const status = doctorStatus(i);
    users.push({
      email: seedEmail(UserRole.DOCTOR, i),
      firstName,
      lastName,
      role: UserRole.DOCTOR,
      status,
      phone: pakistaniPhone(i + 1000),
      avatarUrl: avatarUrl(firstName, lastName),
      emailVerified: status === UserStatus.ACTIVE,
      lastSeenAt: lastSeenAt(i + 200),
      isOnline: status === UserStatus.ACTIVE && i % 4 === 0,
    });
  }

  for (let i = 1; i <= PATIENT_COUNT; i++) {
    const { firstName, lastName } = personName(i + 300, UserRole.PATIENT);
    const status = patientStatus(i);
    users.push({
      email: seedEmail(UserRole.PATIENT, i),
      firstName,
      lastName,
      role: UserRole.PATIENT,
      status,
      phone: pakistaniPhone(i + 2000),
      avatarUrl: avatarUrl(firstName, lastName),
      emailVerified: status === UserStatus.ACTIVE,
      lastSeenAt: lastSeenAt(i + 400),
      isOnline: status === UserStatus.ACTIVE && i % 5 === 0,
    });
  }

  return users;
}

async function removePreviousSeedUsers() {
  const seedEmails = [
    ...Array.from({ length: ADMIN_COUNT }, (_, i) => seedEmail(UserRole.ADMIN, i + 1)),
    ...Array.from({ length: DOCTOR_COUNT }, (_, i) => seedEmail(UserRole.DOCTOR, i + 1)),
    ...Array.from({ length: PATIENT_COUNT }, (_, i) => seedEmail(UserRole.PATIENT, i + 1)),
    ...LEGACY_DEMO_EMAILS,
  ];

  const deleted = await prisma.user.deleteMany({
    where: {
      OR: [{ email: { in: seedEmails } }, { email: { endsWith: `@${SEED_DOMAIN}` } }],
    },
  });

  if (deleted.count > 0) {
    console.log(`Removed ${deleted.count} previously seeded user(s).`);
  }
}

async function ensureSeedUsers(passwordHash: string): Promise<EnsureStats> {
  const seedUsers = buildSeedUsers();
  let created = 0;
  let skipped = 0;

  for (const user of seedUsers) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } });
    if (existing) {
      skipped += 1;
      continue;
    }

    await prisma.user.create({
      data: {
        email: user.email,
        passwordHash,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
        lastSeenAt: user.lastSeenAt,
        isOnline: user.isOnline,
      },
    });
    created += 1;
  }

  console.log(`✓ Seed users ensured: ${created} created, ${skipped} already existed`);
  return { created, skipped };
}

async function ensureDoctorProfiles(): Promise<EnsureStats> {
  const doctorUsers = await prisma.user.findMany({
    where: {
      role: UserRole.DOCTOR,
      email: {
        in: Array.from({ length: DOCTOR_COUNT }, (_, index) => seedEmail(UserRole.DOCTOR, index + 1)),
      },
    },
    orderBy: { email: 'asc' },
  });

  let created = 0;
  let skipped = 0;

  for (const user of doctorUsers) {
    const existing = await prisma.doctorProfile.findUnique({ where: { userId: user.id } });
    if (existing) {
      skipped += 1;
      continue;
    }

    const i = seedIndexFromEmail(user.email, UserRole.DOCTOR);
    const { gender } = personName(i + 100, UserRole.DOCTOR);
    const cityInfo = pick(PAKISTANI_CITIES, i);
    const specialtyInfo = pick(MEDICAL_SPECIALTIES, i);
    const subSpecialty = pick(specialtyInfo.subSpecialties, i);
    const experienceYears = 3 + (i % 28);
    const hospital = pick(PAKISTANI_HOSPITALS, i);
    const university = pick(PAKISTANI_MEDICAL_UNIVERSITIES, i);
    const education = `${university} — MBBS, FCPS (${specialtyInfo.specialty})`;
    const languageCount = 2 + (i % 4);
    const languages = pickMany(ALL_PAKISTANI_LANGUAGES, languageCount, i);
    const rating = Math.round((3.6 + (i % 14) * 0.1) * 10) / 10;
    const reviewCount = 12 + (i * 17) % 480;
    const availability = doctorAvailability(i);
    const licenseNumber = pmdcLicenseNumber(i, cityInfo.code);
    const bioProfile = buildDoctorBioProfile({
      index: i,
      firstName: user.firstName,
      lastName: user.lastName,
      specialty: specialtyInfo.specialty,
      subSpecialty,
      city: cityInfo.city,
      hospital,
      university,
      experienceYears,
      licenseNumber,
      gender,
    });

    await prisma.doctorProfile.create({
      data: {
        userId: user.id,
        specialty: specialtyInfo.specialty,
        subSpecialty,
        licenseNumber,
        doctorNumber: `DOC-${String(1000 + i).padStart(4, '0')}`,
        bio: doctorBio(
          user.firstName,
          user.lastName,
          specialtyInfo.specialty,
          cityInfo.city,
          experienceYears,
          hospital,
        ),
        experienceYears,
        consultationFee: new Prisma.Decimal(consultationFeePkr(i)),
        rating,
        reviewCount,
        availability,
        languages,
        education,
        hospital,
        ...bioProfile,
      },
    });
    created += 1;
  }

  console.log(`✓ Doctor profiles ensured: ${created} created, ${skipped} already existed`);
  return { created, skipped };
}

async function ensurePatientProfiles(): Promise<EnsureStats> {
  const patientUsers = await prisma.user.findMany({
    where: {
      role: UserRole.PATIENT,
      email: {
        in: Array.from({ length: PATIENT_COUNT }, (_, index) => seedEmail(UserRole.PATIENT, index + 1)),
      },
    },
    orderBy: { email: 'asc' },
  });

  let created = 0;
  let skipped = 0;

  for (const user of patientUsers) {
    const existing = await prisma.patientProfile.findUnique({ where: { userId: user.id } });
    if (existing) {
      skipped += 1;
      continue;
    }

    const i = seedIndexFromEmail(user.email, UserRole.PATIENT);
    const allergyCount = i % 4;
    const allergies =
      allergyCount === 0 ? [] : pickMany(COMMON_ALLERGIES, allergyCount, i).slice(0, allergyCount);
    const contactFirst = pick(PAKISTANI_FIRST_NAMES_MALE, i + 50);
    const contactLast = pick(PAKISTANI_LAST_NAMES, i + 60);

    await prisma.patientProfile.create({
      data: {
        userId: user.id,
        patientNumber: `PT-${String(1000 + i).padStart(4, '0')}`,
        dateOfBirth: dateOfBirth(i),
        gender: pick(GENDERS, i),
        bloodGroup: pick(BLOOD_GROUPS, i),
        allergies,
        medicalHistory: pick(MEDICAL_HISTORY_SNIPPETS, i),
        emergencyContact: emergencyContact(contactFirst, contactLast, i),
      },
    });
    created += 1;
  }

  console.log(`✓ Patient profiles ensured: ${created} created, ${skipped} already existed`);
  return { created, skipped };
}

async function ensureRefreshTokens(
  users: Array<{ id: string; role: UserRole; status: UserStatus; email: string }>,
): Promise<EnsureStats> {
  const existingCount = await prisma.refreshToken.count({
    where: { user: { email: { endsWith: `@${SEED_DOMAIN}` } } },
  });

  if (existingCount > 0) {
    console.log(`✓ Refresh tokens already exist (${existingCount}), skipping`);
    return { created: 0, skipped: existingCount };
  }

  const created = await seedRefreshTokens(users);
  console.log(`✓ Refresh tokens created: ${created}`);
  return { created, skipped: 0 };
}

async function seedRefreshTokens(
  users: Array<{ id: string; role: UserRole; status: UserStatus; email: string }>,
) {
  const eligible = users.filter((user) => user.status === UserStatus.ACTIVE);
  const sampleSize = Math.min(35, eligible.length);
  const sampled = eligible.filter((_, index) => index % Math.ceil(eligible.length / sampleSize) === 0);

  const now = new Date();
  const tokens = sampled.flatMap((user, index) => {
    const entries: Prisma.RefreshTokenCreateManyInput[] = [];
    const activeToken = randomBytes(64).toString('hex');
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + (index % 2 === 0 ? 7 : -2));

    entries.push({
      token: activeToken,
      userId: user.id,
      expiresAt,
      revoked: index % 5 === 0,
    });

    if (index % 3 === 0) {
      const revokedToken = randomBytes(64).toString('hex');
      const pastExpiry = new Date(now);
      pastExpiry.setDate(pastExpiry.getDate() - 3);
      entries.push({
        token: revokedToken,
        userId: user.id,
        expiresAt: pastExpiry,
        revoked: true,
      });
    }

    return entries;
  });

  if (tokens.length === 0) return 0;

  await prisma.refreshToken.createMany({ data: tokens });
  return tokens.length;
}

async function loadExistingPhase1Users() {
  return prisma.user.findMany({
    where: { email: { endsWith: `@${SEED_DOMAIN}` } },
    orderBy: { email: 'asc' },
  });
}

async function main() {
  assertDevelopmentEnvironment();

  const phase = process.env.SEED_PHASE?.toLowerCase();
  if (phase === '2') {
    const contentStats = await seedContentPhase(prisma);
    console.log('Phase 2 content seed completed successfully.');
    console.log(contentStats);
    return;
  }

  if (phase === '3') {
    const operationalStats = await seedOperationalPhase(prisma);
    console.log('Phase 3 operational seed completed successfully.');
    console.log(operationalStats);
    return;
  }

  if (phase === '4' || phase === 'finalize') {
    const finalizeStats = await seedFinalizePhase(prisma);
    console.log('Phase 4 finalize completed successfully.');
    console.log(finalizeStats);
    return;
  }

  if (phase === 'publications') {
    const publicationStats = await seedPublications(prisma);
    console.log('Publications seed completed successfully.');
    console.log(publicationStats);
    return;
  }

  const expectedUserCount = ADMIN_COUNT + DOCTOR_COUNT + PATIENT_COUNT;
  const existingUsers = await loadExistingPhase1Users();

  if (existingUsers.length > 0) {
    logRoleCounts(existingUsers);
    console.log('✓ Reusing existing data');
  } else {
    console.log('Starting Phase 1 seed (User, DoctorProfile, PatientProfile, RefreshToken)...');
  }

  if (process.env.SEED_FORCE_RESET === 'true') {
    console.log('⚠ SEED_FORCE_RESET=true — removing previously seeded @drinsight.pk users...');
    await removePreviousSeedUsers();
  }

  const passwordHash = await hashPassword(SEED_PASSWORD);
  const userStats = await ensureSeedUsers(passwordHash);
  const doctorProfileStats = await ensureDoctorProfiles();
  const patientProfileStats = await ensurePatientProfiles();

  const users = await loadExistingPhase1Users();
  const refreshTokenStats = await ensureRefreshTokens(users);

  const admins = users.filter((user) => user.role === UserRole.ADMIN);
  const doctors = users.filter((user) => user.role === UserRole.DOCTOR);
  const patients = users.filter((user) => user.role === UserRole.PATIENT);

  if (admins.length === 0 || doctors.length === 0 || patients.length === 0) {
    throw new Error(
      `Cannot continue seeding: need at least 1 admin, 1 doctor, and 1 patient (found admins=${admins.length}, doctors=${doctors.length}, patients=${patients.length}).`,
    );
  }

  if (users.length < expectedUserCount) {
    console.log(
      `ℹ Seed user coverage: ${users.length}/${expectedUserCount} canonical @${SEED_DOMAIN} users present — continuing with available data.`,
    );
  }

  await seedSiteSettings(prisma);
  await seedAboutContent(prisma);
  await seedAdminCms(prisma);

  const contentStats = await seedContentPhase(prisma);
  const operationalStats = await seedOperationalPhase(prisma);
  const finalizeStats = await seedFinalizePhase(prisma);
  const publicationStats = await seedPublications(prisma);

  const doctorProfileCount = await prisma.doctorProfile.count();
  const patientProfileCount = await prisma.patientProfile.count();
  const refreshTokenCount = await prisma.refreshToken.count({
    where: { user: { email: { endsWith: `@${SEED_DOMAIN}` } } },
  });

  console.log('Seed completed successfully.');
  console.log({
    users: users.length,
    admins: admins.length,
    doctors: doctors.length,
    patients: patients.length,
    phase1: {
      users: userStats,
      doctorProfiles: doctorProfileStats,
      patientProfiles: patientProfileStats,
      refreshTokens: refreshTokenStats,
    },
    doctorProfiles: doctorProfileCount,
    patientProfiles: patientProfileCount,
    refreshTokens: refreshTokenCount,
    content: contentStats,
    operational: operationalStats,
    finalize: {
      allModelsCovered: finalizeStats.allModelsCovered,
      doctorProfilesSynced: finalizeStats.doctorProfilesSynced,
      conversationsSynced: finalizeStats.conversationsSynced,
    },
    publications: publicationStats,
    defaultPassword: SEED_PASSWORD,
    sampleAdmin: admins[0]?.email,
    sampleDoctor: doctors[0]?.email,
    samplePatient: patients[0]?.email,
  });
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
