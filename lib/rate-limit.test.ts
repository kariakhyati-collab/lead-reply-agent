import { describe, expect, it } from "vitest";

import { clientKey, RateLimiter } from "./rate-limit";

function clock(start = 0) {
  let t = start;
  return { now: () => t, advance: (ms: number) => (t += ms) };
}

describe("RateLimiter", () => {
  it("allows up to the limit, then blocks", () => {
    const c = clock();
    const rl = new RateLimiter({ limit: 3, windowMs: 1000, now: c.now });
    expect(rl.check("a")).toMatchObject({ allowed: true, remaining: 2 });
    expect(rl.check("a")).toMatchObject({ allowed: true, remaining: 1 });
    expect(rl.check("a")).toMatchObject({ allowed: true, remaining: 0 });
    expect(rl.check("a")).toMatchObject({ allowed: false, remaining: 0, resetAt: 1000 });
  });

  it("tracks keys independently", () => {
    const rl = new RateLimiter({ limit: 1, windowMs: 1000, now: clock().now });
    expect(rl.check("a").allowed).toBe(true);
    expect(rl.check("b").allowed).toBe(true);
    expect(rl.check("a").allowed).toBe(false);
  });

  it("resets after the window", () => {
    const c = clock();
    const rl = new RateLimiter({ limit: 1, windowMs: 1000, now: c.now });
    expect(rl.check("a").allowed).toBe(true);
    c.advance(999);
    expect(rl.check("a").allowed).toBe(false);
    c.advance(1);
    expect(rl.check("a")).toMatchObject({ allowed: true, resetAt: 2000 });
  });

  it("caps memory by pruning expired and then oldest keys", () => {
    const c = clock();
    const rl = new RateLimiter({ limit: 1, windowMs: 1000, now: c.now, maxKeys: 2 });
    rl.check("a");
    rl.check("b");
    rl.check("c");
    expect(rl.size).toBe(2);
    c.advance(1000);
    rl.check("d");
    expect(rl.size).toBe(1);
  });

  it("rejects invalid options", () => {
    expect(() => new RateLimiter({ limit: 0, windowMs: 1000 })).toThrow();
    expect(() => new RateLimiter({ limit: 1, windowMs: 0 })).toThrow();
  });
});

describe("clientKey", () => {
  it("uses the first x-forwarded-for address", () => {
    expect(clientKey(new Headers({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" }))).toBe("203.0.113.5");
  });
  it("falls back to x-real-ip, then a shared bucket", () => {
    expect(clientKey(new Headers({ "x-real-ip": "198.51.100.7" }))).toBe("198.51.100.7");
    expect(clientKey(new Headers())).toBe("anonymous");
  });
});
