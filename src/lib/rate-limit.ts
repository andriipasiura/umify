import 'server-only';

import { sql } from 'drizzle-orm';

import { db } from '@/lib/db';
import { rateLimits } from '@/lib/db/schema';

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
  now?: Date;
};

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSeconds: number };

export const consumeRateLimit = async ({
  key,
  limit,
  windowMs,
  now = new Date(),
}: RateLimitOptions): Promise<RateLimitResult> => {
  const windowStart = new Date(Math.floor(now.getTime() / windowMs) * windowMs);

  const [row] = await db
    .insert(rateLimits)
    .values({ key, windowStart, count: 1 })
    .onConflictDoUpdate({
      target: [rateLimits.key, rateLimits.windowStart],
      set: { count: sql`${rateLimits.count} + 1` },
    })
    .returning({ count: rateLimits.count });

  if (row.count > limit) {
    const windowEnd = windowStart.getTime() + windowMs;
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((windowEnd - now.getTime()) / 1000)),
    };
  }
  return { ok: true, remaining: limit - row.count };
};
