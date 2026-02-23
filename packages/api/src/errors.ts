/**
 * Error thrown by the Forge API client.
 *
 * Contains the HTTP status code, error message, request URL,
 * and the raw response body for debugging.
 */
export class ForgeApiError extends Error {
  readonly status: number;
  readonly url: string;
  readonly body: unknown;

  constructor(options: { status: number; message: string; url: string; body?: unknown }) {
    super(options.message);
    this.name = "ForgeApiError";
    this.status = options.status;
    this.url = options.url;
    this.body = options.body;
  }

  /**
   * Human-readable error description based on status code.
   */
  get statusText(): string {
    switch (this.status) {
      case 401:
        return "Invalid API token";
      case 403:
        return "Insufficient permissions";
      case 404:
        return "Resource not found";
      case 422:
        return "Validation error";
      case 429:
        return "Rate limit exceeded";
      case 500:
        return "Forge server error";
      default:
        return `HTTP ${this.status}`;
    }
  }
}

/**
 * Type guard for ForgeApiError.
 */
export function isForgeApiError(error: unknown): error is ForgeApiError {
  return error instanceof ForgeApiError;
}
