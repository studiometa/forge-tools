import type { ForgeOptions } from "./types.ts";

import { ForgeApiError } from "./errors.ts";
import { RateLimiter } from "./rate-limiter.ts";

const DEFAULT_BASE_URL = "https://forge.laravel.com/api/v1";

/**
 * Low-level HTTP client for the Laravel Forge API.
 *
 * Handles authentication, rate limiting, and error handling.
 * Used internally by the SDK — not intended for direct use.
 *
 * @example
 * ```ts
 * const client = new HttpClient({
 *   token: 'your-api-token',
 * });
 *
 * const servers = await client.get<ServersResponse>('/servers');
 * ```
 */
export class HttpClient {
  private readonly token: string;
  private readonly baseUrl: string;
  private readonly fetch: typeof globalThis.fetch;
  private readonly rateLimiter: RateLimiter;

  constructor(options: { token: string } & ForgeOptions) {
    this.token = options.token;
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.fetch = options.fetch ?? globalThis.fetch;
    this.rateLimiter = new RateLimiter(options.rateLimit);
  }

  /**
   * Make a GET request.
   */
  async get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  /**
   * Make a POST request.
   */
  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  /**
   * Make a PUT request.
   */
  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PUT", path, body);
  }

  /**
   * Make a DELETE request.
   */
  async delete(path: string): Promise<void> {
    await this.request<void>("DELETE", path);
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    await this.rateLimiter.throttle();

    let attempt = 0;

    while (true) {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/json",
      };

      if (body !== undefined) {
        headers["Content-Type"] = "application/json";
      }

      const response = await this.fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      this.rateLimiter.updateFromHeaders(response.headers);

      // Handle rate limiting with retry
      if (response.status === 429) {
        const retryDelay = this.rateLimiter.getRetryDelay(attempt, response.headers);
        if (retryDelay !== null) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          attempt++;
          continue;
        }
      }

      // Handle errors
      if (!response.ok) {
        let responseBody: unknown;
        try {
          responseBody = await response.json();
        } catch {
          responseBody = await response.text().catch(() => null);
        }

        const message = this.extractErrorMessage(response.status, responseBody);

        throw new ForgeApiError({
          status: response.status,
          message,
          url,
          body: responseBody,
        });
      }

      // 204 No Content — return void
      if (response.status === 204) {
        return undefined as T;
      }

      // Parse response
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return (await response.json()) as T;
      }

      // For non-JSON responses (e.g., plain text like env content)
      return (await response.text()) as T;
    }
  }

  private extractErrorMessage(status: number, body: unknown): string {
    // Forge API error format: { "message": "..." }
    if (body !== null && typeof body === "object" && "message" in body) {
      return (body as { message: string }).message;
    }

    switch (status) {
      case 401:
        return "Invalid API token. Check your FORGE_API_TOKEN.";
      case 403:
        return "Insufficient permissions. Your API token may not have the required scopes.";
      case 404:
        return "Resource not found.";
      case 422:
        return "Validation error.";
      case 429:
        return "Rate limit exceeded (60 requests/minute). Please retry later.";
      case 500:
        return "Forge server error. Please try again later.";
      default:
        return `Forge API error (HTTP ${status})`;
    }
  }
}
