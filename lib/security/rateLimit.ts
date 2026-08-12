/**
 * Best-effort in-memory rate limiter for public form endpoints
 * (/api/subscribe, /api/contact).
 *
 * Note: this is per-server-instance state. On serverless platforms
 * (Vercel) with multiple concurrent instances this only throttles
 * within a warm instance, not globally — it stops simple flood/bot
 * scripts hitting a single instance repeatedly, but is not a substitute
 * for an edge/WAF rate limiter (e.g. Upstash Ratelimit) if you later
 * need hard guarantees under real attack traffic.
 */

type Bucket = { count: number; windowStart: number };

const buckets = new Map<string, Bucket>();

// Periodically drop stale buckets so this map doesn't grow unbounded
// on a long-lived instance.
const MAX_BUCKETS = 5000;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * @param key Unique identifier for the caller, e.g. `subscribe:${ip}`.
 * @param limit Max requests allowed per window.
 * @param windowMs Window length in milliseconds.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  if (buckets.size > MAX_BUCKETS) {
    for (const [k, b] of buckets) {
      if (now - b.windowStart > windowMs) buckets.delete(k);
    }
  }

  const existing = buckets.get(key);
  if (!existing || now - existing.windowStart > windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    const retryAfterSeconds = Math.ceil((existing.windowStart + windowMs - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, retryAfterSeconds: 0 };
}

/**
 * Honeypot check for a hidden form field (e.g. `website`) that real users
 * never fill in but simple bots do. Returns true if the submission looks
 * like a bot (honeypot filled, or submitted implausibly fast).
 */
export function looksLikeBot(honeypotValue: unknown, submittedAtMs?: number, minHumanMs = 1500): boolean {
  if (typeof honeypotValue === 'string' && honeypotValue.trim() !== '') return true;
  if (typeof submittedAtMs === 'number' && Date.now() - submittedAtMs < minHumanMs) return true;
  return false;
}
