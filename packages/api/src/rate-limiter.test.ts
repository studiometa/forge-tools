import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RateLimiter } from "./rate-limiter.ts";

describe("RateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("throttle", () => {
    it("should allow requests within the limit", async () => {
      const limiter = new RateLimiter();

      // Should not throw or delay for a single request
      await limiter.throttle();
    });

    it("should delay when limit is reached", async () => {
      const limiter = new RateLimiter();

      // Fill the window with 60 requests
      for (let i = 0; i < 60; i++) {
        await limiter.throttle();
      }

      // The 61st should trigger a delay
      const throttlePromise = limiter.throttle();
      // Advance time past the window
      await vi.advanceTimersByTimeAsync(60_001);
      await throttlePromise;
    });
  });

  describe("updateFromHeaders", () => {
    it("should trust API remaining count", () => {
      const limiter = new RateLimiter();

      const headers = new Headers({
        "x-ratelimit-remaining": "55",
      });

      limiter.updateFromHeaders(headers);
      // Should not throw — headers indicate capacity
    });

    it("should handle missing headers gracefully", () => {
      const limiter = new RateLimiter();
      const headers = new Headers();
      limiter.updateFromHeaders(headers);
    });
  });

  describe("getRetryDelay", () => {
    it("should return null when max retries exceeded", () => {
      const limiter = new RateLimiter({ maxRetries: 2 });

      expect(limiter.getRetryDelay(2)).toBeNull();
      expect(limiter.getRetryDelay(3)).toBeNull();
    });

    it("should use Retry-After header when present", () => {
      const limiter = new RateLimiter();
      const headers = new Headers({ "retry-after": "30" });

      expect(limiter.getRetryDelay(0, headers)).toBe(30_000);
    });

    it("should use exponential backoff with jitter", () => {
      const limiter = new RateLimiter({ baseDelay: 1000 });

      const delay0 = limiter.getRetryDelay(0);
      expect(delay0).not.toBeNull();
      // 2^0 * 1000 = 1000, plus up to 1000 jitter → 1000-2000
      expect(delay0).toBeGreaterThanOrEqual(1000);
      expect(delay0!).toBeLessThanOrEqual(2000);

      const delay1 = limiter.getRetryDelay(1);
      expect(delay1).not.toBeNull();
      // 2^1 * 1000 = 2000, plus up to 1000 jitter → 2000-3000
      expect(delay1).toBeGreaterThanOrEqual(2000);
      expect(delay1!).toBeLessThanOrEqual(3000);
    });

    it("should return null when maxRetries is 0", () => {
      const limiter = new RateLimiter({ maxRetries: 0 });
      expect(limiter.getRetryDelay(0)).toBeNull();
    });

    it("should handle non-numeric Retry-After", () => {
      const limiter = new RateLimiter();
      const headers = new Headers({ "retry-after": "not-a-number" });

      // Should fall back to exponential backoff
      const delay = limiter.getRetryDelay(0, headers);
      expect(delay).not.toBeNull();
      expect(delay).toBeGreaterThanOrEqual(1000);
    });
  });
});
