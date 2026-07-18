import 'dotenv/config';
import { createPrismaClient } from '../src/prisma/create-prisma-client';
import { seedPublications } from './seed-publications';

const prisma = createPrismaClient();

seedPublications(prisma)
  .then((stats) => {
    console.log('Publications seed completed successfully.');
    console.log(stats);
  })
  .catch((error) => {
    console.error('Publications seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
