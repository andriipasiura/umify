import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { env } from '@/env';

declare global {
  var pgPoolGlobal: Pool | undefined;
}

const pool = globalThis.pgPoolGlobal ?? new Pool({ connectionString: env.DATABASE_URL });

if (env.NODE_ENV !== 'production') {
  globalThis.pgPoolGlobal = pool;
}

export const db = drizzle({ client: pool });
