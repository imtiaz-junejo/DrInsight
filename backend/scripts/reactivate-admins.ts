import 'dotenv/config';
import { UserRole, UserStatus } from '@prisma/client';
import { createPrismaClient } from '../src/prisma/create-prisma-client';

const prisma = createPrismaClient();
const SUPER_ADMIN_EMAIL = 'javed.kumbhar@drinsight.pk';

async function main() {
  const before = await prisma.user.findMany({
    where: { role: UserRole.ADMIN },
    select: { email: true, firstName: true, lastName: true, status: true },
    orderBy: { email: 'asc' },
  });

  console.log('Admin accounts before:');
  console.table(before);

  const reactivated = await prisma.user.updateMany({
    where: { role: UserRole.ADMIN },
    data: {
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  let superAdmin = await prisma.user.findUnique({
    where: { email: SUPER_ADMIN_EMAIL },
  });

  if (!superAdmin) {
    superAdmin = await prisma.user.findFirst({
      where: {
        firstName: { equals: 'Javed', mode: 'insensitive' },
        lastName: { equals: 'Kumbhar', mode: 'insensitive' },
      },
    });
  }

  if (!superAdmin) {
    throw new Error(
      `Could not find Dr Javed Kumbhar (${SUPER_ADMIN_EMAIL}). Create the account first or update SUPER_ADMIN_EMAIL in scripts/reactivate-admins.ts.`,
    );
  }

  superAdmin = await prisma.user.update({
    where: { id: superAdmin.id },
    data: {
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  console.log(`Promoted ${superAdmin.email} to super admin.`);

  const after = await prisma.user.findMany({
    where: { role: UserRole.ADMIN },
    select: { email: true, firstName: true, lastName: true, status: true, emailVerified: true },
    orderBy: { email: 'asc' },
  });

  console.log(`\nReactivated ${reactivated.count} existing admin account(s).`);
  console.log('All admin accounts now:');
  console.table(after);

  console.log('\nSuper admin login:');
  console.log({
    email: superAdmin.email,
    name: `${superAdmin.firstName} ${superAdmin.lastName}`,
    role: superAdmin.role,
    status: superAdmin.status,
    note: 'Use your existing password. Demo seed default is Password123! if unchanged.',
  });
}

main()
  .catch((error) => {
    console.error('Failed to reactivate admins:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
