import { PrismaClient } from '@prisma/client';

declare global {
  // @ts-ignore
  var prisma: PrismaClient | undefined;
}

export const prisma =
  // @ts-ignore
  global.prisma ||
  new PrismaClient({
    log: ['query'],
  });

// @ts-ignore
if (process.env.NODE_ENV !== 'production') {
  // @ts-ignore
  global.prisma = prisma;
}
