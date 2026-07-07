import 'dotenv/config';
import { createPrismaClient } from '../../src/prisma/create-prisma-client';
import { mergeHeartHealthIntoCardiology } from '../merge-heart-health';

async function main() {
  const prisma = createPrismaClient();
  try {
    const result = await mergeHeartHealthIntoCardiology(prisma);
    console.log('Heart Health → Cardiology merge complete:', result);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
