import 'dotenv/config';
import { createPrismaClient } from '../src/prisma/create-prisma-client';

const prisma = createPrismaClient();
const email = process.argv[2];

if (!email) {
  console.error('Usage: npx ts-node scripts/activate-user.ts <email>');
  process.exit(1);
}

async function main() {
  const user = await prisma.user.update({
    where: { email: email.trim().toLowerCase() },
    data: { status: 'ACTIVE' },
    select: { email: true, role: true, status: true, firstName: true, lastName: true },
  });
  console.log('Activated user:', user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
