import "server-only";

/**
 * In-memory token bucket rate limiter.
 * Suitable for single-instance deployments. For distributed systems,
 * replace with Redis-backed solution (e.g., @upstash/ratelimit).
 */

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

interface RateLimiterConfig {
  maxTokens: number;
  refillRate: number;
  refillInterval: number;
}

const buckets = new Map<string, TokenBucket>();

const CLEANUP_INTERVAL = 60 * 60 * 1000;
const BUCKET_EXPIRY = 2 * 60 * 60 * 1000;

let lastCleanup = Date.now();

function cleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  for (const [key, bucket] of buckets) {
    if (now - bucket.lastRefill > BUCKET_EXPIRY) {
      buckets.delete(key);
    }
  }
  lastCleanup = now;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

export function rateLimit(
  identifier: string,
  config: RateLimiterConfig
): RateLimitResult {
  cleanup();

  const now = Date.now();
  const { maxTokens, refillRate, refillInterval } = config;

  let bucket = buckets.get(identifier);

  if (!bucket) {
    bucket = { tokens: maxTokens, lastRefill: now };
    buckets.set(identifier, bucket);
  }

  const elapsed = now - bucket.lastRefill;
  const tokensToAdd = Math.floor(elapsed / refillInterval) * refillRate;

  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  const reset = bucket.lastRefill + refillInterval;

  if (bucket.tokens < 1) {
    return { success: false, remaining: 0, reset };
  }

  bucket.tokens -= 1;
  return { success: true, remaining: bucket.tokens, reset };
}

export const VISITOR_RATE_LIMIT: RateLimiterConfig = {
  maxTokens: 3,
  refillRate: 3,
  refillInterval: 60 * 60 * 1000,
};
