/**
 * Fixed-window, in-memory rate limiter keyed by client (usually IP).
 *
 * Best-effort only: state lives in one server instance's memory, so it resets
 * on restart and is not shared between serverless instances. It stops casual
 * abuse of a public demo; it is not a security boundary.
 */

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  /** Epoch ms when the current window resets. */
  resetAt: number;
};

export type RateLimiterOptions = {
  limit: number;
  windowMs: number;
  /** Injectable clock for tests. */
  now?: () => number;
  /** Upper bound on tracked keys, so memory cannot grow without limit. */
  maxKeys?: number;
};

type Bucket = { count: number; resetAt: number };

export class RateLimiter {
  private readonly buckets = new Map<string, Bucket>();
  private readonly limit: number;
  private readonly windowMs: number;
  private readonly now: () => number;
  private readonly maxKeys: number;

  constructor({ limit, windowMs, now = Date.now, maxKeys = 10_000 }: RateLimiterOptions) {
    if (limit < 1) throw new Error("limit must be at least 1");
    if (windowMs <= 0) throw new Error("windowMs must be positive");
    this.limit = limit;
    this.windowMs = windowMs;
    this.now = now;
    this.maxKeys = maxKeys;
  }

  check(key: string): RateLimitResult {
    const now = this.now();
    let bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      if (!bucket && this.buckets.size >= this.maxKeys) this.prune(now);
      bucket = { count: 0, resetAt: now + this.windowMs };
      this.buckets.set(key, bucket);
    }

    if (bucket.count >= this.limit) {
      return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
    }

    bucket.count += 1;
    return { allowed: true, remaining: this.limit - bucket.count, resetAt: bucket.resetAt };
  }

  /** Number of keys currently tracked (for tests and diagnostics). */
  get size(): number {
    return this.buckets.size;
  }

  private prune(now: number): void {
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
    // Still full: drop the oldest entries (Map preserves insertion order).
    while (this.buckets.size >= this.maxKeys) {
      const oldest = this.buckets.keys().next().value;
      if (oldest === undefined) break;
      this.buckets.delete(oldest);
    }
  }
}

/** Best-effort client key from proxy headers. */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "anonymous";
}
