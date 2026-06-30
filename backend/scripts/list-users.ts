import 'dotenv/config';
import { createPrismaClient } from '../src/prisma/create-prisma-client';

const prisma = createPrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true, status: true, firstName: true, lastName: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  console.table(users);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
