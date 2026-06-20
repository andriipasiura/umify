import { PrismaClient } from '@prisma/client';

import { env } from '@/env';

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

export const db = globalThis.prismaGlobal ?? new PrismaClient();

if (env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = db;
}
