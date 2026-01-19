import "server-only";

import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);

const WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_REQUESTS = 1;

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

export async function checkVisitorRateLimit(
  identifier: string
): Promise<RateLimitResult> {
  const key = `visitor:${identifier}`;
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const multi = redis.multi();
  multi.zremrangebyscore(key, 0, windowStart);
  multi.zcard(key);
  multi.zadd(key, now.toString(), `${now}`);
  multi.pexpire(key, WINDOW_MS);

  const results = await multi.exec();
  const count = (results?.[1]?.[1] as number) ?? 0;

  const success = count < MAX_REQUESTS;
  const remaining = Math.max(0, MAX_REQUESTS - count - (success ? 1 : 0));

  const oldestEntry = await redis.zrange(key, 0, 0, "WITHSCORES");
  const reset =
    oldestEntry.length >= 2
      ? parseInt(oldestEntry[1], 10) + WINDOW_MS
      : now + WINDOW_MS;

  return { success, remaining, reset };
}
