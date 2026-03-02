/**
 * Error types for forge.
 *
 * Provides specific error types for different failure scenarios with
 * recovery hints for both humans and AI agents.
 */

/**
 * Base error class for all CLI errors.
 */
export abstract class CliError extends Error {
  abstract readonly code: string;
  abstract readonly isRecoverable: boolean;

  constructor(
    message: string,
    public readonly hints?: string[],
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;

    Error.captureStackTrace?.(this, this.constructor);
  }

  toJSON(): Record<string, unknown> {
    return {
      error: this.code,
      name: this.name,
      message: this.message,
      isRecoverable: this.isRecoverable,
      ...(this.hints && this.hints.length > 0 ? { hints: this.hints } : {}),
      ...(this.cause instanceof Error ? { cause: { message: this.cause.message } } : {}),
    };
  }

  toFormattedMessage(): string {
    let msg = this.message;
    if (this.hints && this.hints.length > 0) {
      msg += "\n\nHints:\n" + this.hints.map((h) => `  • ${h}`).join("\n");
    }
    return msg;
  }
}

// ── Config Errors ────────────────────────────────────

export class ConfigError extends CliError {
  readonly code = "CONFIG_ERROR";
  readonly isRecoverable = true;

  static missingToken(): ConfigError {
    return new ConfigError("API token not configured", [
      "Set via CLI flag: --token <token>",
      "Set via environment: export FORGE_API_TOKEN=<token>",
      "Set via config: forge config set YOUR_TOKEN",
    ]);
  }
}

// ── Validation Errors ────────────────────────────────

export class ValidationError extends CliError {
  readonly code = "VALIDATION_ERROR";
  readonly isRecoverable = true;

  constructor(
    message: string,
    public readonly field?: string,
    hints?: string[],
    cause?: unknown,
  ) {
    super(message, hints, cause);
  }

  override toJSON() {
    return { ...super.toJSON(), field: this.field };
  }

  static required(field: string, hints?: string[]): ValidationError {
    return new ValidationError(`${field} is required`, field, hints);
  }
}

// ── API Errors ───────────────────────────────────────

export class ApiError extends CliError {
  readonly code = "API_ERROR";
  readonly isRecoverable: boolean;

  constructor(
    message: string,
    public readonly statusCode?: number,
    hints?: string[],
    cause?: unknown,
  ) {
    super(message, hints ?? getApiErrorHints(statusCode), cause);
    this.isRecoverable = statusCode === undefined || (statusCode >= 500 && statusCode < 600);
  }

  override toJSON() {
    return { ...super.toJSON(), statusCode: this.statusCode };
  }

  static fromForgeError(error: unknown): ApiError {
    if (error instanceof Error && "statusCode" in error) {
      const e = error as Error & { statusCode?: number };
      return new ApiError(e.message, e.statusCode, undefined, e);
    }
    if (error instanceof Error) {
      return new ApiError(error.message, undefined, undefined, error);
    }
    return new ApiError(String(error));
  }
}

function getApiErrorHints(statusCode?: number): string[] {
  if (statusCode === 401) {
    return ["Check that your API token is valid", "Set via: export FORGE_API_TOKEN=<token>"];
  }
  if (statusCode === 403) {
    return ["You may not have permission to access this resource"];
  }
  if (statusCode === 404) {
    return [
      "The resource may not exist",
      "Verify the ID is correct",
      "Use the list command to find valid IDs",
    ];
  }
  if (statusCode === 429) {
    return ["Too many requests — wait before retrying"];
  }
  if (statusCode !== undefined && statusCode >= 500) {
    return ["Server error — try again later"];
  }
  return [];
}

// ── Type Guards ──────────────────────────────────────

export function isCliError(error: unknown): error is CliError {
  return error instanceof CliError;
}
