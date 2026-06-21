import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

export function createPrismaAdapter(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }
  return new PrismaPg({ connectionString });
}

export function createPrismaClient(connectionString = process.env.DATABASE_URL) {
  return new PrismaClient({ adapter: createPrismaAdapter(connectionString) });
}
