import type { RateLimitOptions } from "./types.ts";

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_DELAY = 1000;
const WINDOW_MS = 60_000; // 60 seconds
const MAX_REQUESTS = 60; // 60 requests per minute

/**
 * Rate limiter for the Forge API.
 *
 * Uses a sliding window to track requests and automatic retry
 * with exponential backoff + jitter on 429 responses.
 */
export class RateLimiter {
  private readonly maxRetries: number;
  private readonly baseDelay: number;
  private timestamps: number[] = [];

  constructor(options?: RateLimitOptions) {
    this.maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.baseDelay = options?.baseDelay ?? DEFAULT_BASE_DELAY;
  }

  /**
   * Wait if necessary to stay within the rate limit window.
   */
  async throttle(): Promise<void> {
    const now = Date.now();
    // Remove timestamps outside the window
    this.timestamps = this.timestamps.filter((t) => now - t < WINDOW_MS);

    if (this.timestamps.length >= MAX_REQUESTS) {
      // Wait until the oldest timestamp exits the window
      const oldestTimestamp = this.timestamps[0]!;
      const waitMs = WINDOW_MS - (now - oldestTimestamp) + 1;
      await this.sleep(waitMs);
    }

    this.timestamps.push(Date.now());
  }

  /**
   * Update internal state from response headers.
   */
  updateFromHeaders(headers: Headers): void {
    const remaining = headers.get("x-ratelimit-remaining");
    if (remaining !== null) {
      const remainingCount = Number.parseInt(remaining, 10);
      // If the API says we have more capacity than our window thinks,
      // trust the API — it has the ground truth
      if (remainingCount > MAX_REQUESTS - this.timestamps.length) {
        this.timestamps = [];
      }
    }
  }

  /**
   * Calculate retry delay for a 429 response.
   * Returns null if max retries exceeded.
   */
  getRetryDelay(attempt: number, headers?: Headers): number | null {
    if (attempt >= this.maxRetries) {
      return null;
    }

    // Check Retry-After header first
    const retryAfter = headers?.get("retry-after");
    if (retryAfter !== null && retryAfter !== undefined) {
      const seconds = Number.parseInt(retryAfter, 10);
      if (!Number.isNaN(seconds)) {
        return seconds * 1000;
      }
    }

    // Exponential backoff with jitter
    const exponentialDelay = this.baseDelay * 2 ** attempt;
    const jitter = Math.random() * this.baseDelay;
    return exponentialDelay + jitter;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
