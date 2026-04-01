// ── Options ──────────────────────────────────────────

/**
 * Options for the Forge API client.
 */
export interface ForgeOptions {
  /** Custom fetch implementation (for testing). */
  fetch?: typeof globalThis.fetch;
  /** Custom base URL (default: https://forge.laravel.com/api). */
  baseUrl?: string;
  /** Rate limiter options. */
  rateLimit?: RateLimitOptions;
}

/**
 * Rate limiter configuration.
 */
export interface RateLimitOptions {
  /** Maximum number of retries on 429 (default: 3). */
  maxRetries?: number;
  /** Base delay in ms for exponential backoff (default: 1000). */
  baseDelay?: number;
}

// ── Config types ─────────────────────────────────────

export interface ForgeConfig {
  apiToken: string;
  /** Default organization slug for v2 API (e.g. "studio-meta"). */
  organizationSlug?: string;
}
