/**
 * CLI execution context with dependency injection.
 *
 * Instead of hidden dependencies in command handlers, this module provides
 * explicit dependency passing for testability and transparency.
 */

import type { HttpClient } from "@studiometa/forge-api";
import type { ExecutorContext } from "@studiometa/forge-core";

import type { OutputFormat } from "./types.ts";

import { HttpClient as ForgeHttpClient } from "@studiometa/forge-api";
import { ConfigError } from "./errors.ts";
import { createConfigStore, getToken } from "./config.ts";
import { OutputFormatter } from "./output.ts";

export interface CommandOptions {
  [key: string]: string | boolean | string[] | undefined;
  format?: string;
  f?: string;
  token?: string;
  "no-color"?: boolean;
}

/**
 * Context containing all dependencies needed by command handlers.
 */
export interface CommandContext {
  /** Output formatter for the current format */
  readonly formatter: OutputFormatter;
  /** Raw CLI options */
  readonly options: CommandOptions;
  /** Create an ExecutorContext from this command context */
  createExecutorContext(token: string): ExecutorContext;
  /** Resolve the API token or throw ConfigError */
  getToken(): string;
}

/**
 * Creates a command context from CLI options.
 */
export function createContext(options: CommandOptions = {}): CommandContext {
  const format = (options.format ?? options.f ?? "human") as OutputFormat;
  const noColor = options["no-color"] === true;
  const formatter = new OutputFormatter(format, noColor);

  return {
    formatter,
    options,

    createExecutorContext(token: string): ExecutorContext {
      const client = new ForgeHttpClient({ token }) as unknown as HttpClient;
      return { client };
    },

    getToken(): string {
      // 1. CLI arg
      if (typeof options.token === "string" && options.token) {
        return options.token;
      }
      // 2. Env var / config file
      const stored = getToken(createConfigStore());
      if (stored) {
        return stored;
      }
      // 3. Not found — throw
      throw ConfigError.missingToken();
    },
  };
}

/**
 * Creates a test context for unit tests.
 *
 * @example
 * ```typescript
 * const ctx = createTestContext({
 *   mockClient: { get: async () => ({ servers: [] }) } as never,
 * });
 * ```
 */
export function createTestContext(overrides: {
  options?: CommandOptions;
  formatter?: OutputFormatter;
  token?: string;
  mockClient?: HttpClient;
}): CommandContext {
  const opts: CommandOptions = overrides.options ?? {
    format: "json",
    "no-color": true,
  };
  const format = (opts.format ?? "json") as OutputFormat;
  const formatter = overrides.formatter ?? new OutputFormatter(format, true);

  return {
    formatter,
    options: opts,
    createExecutorContext(_token: string): ExecutorContext {
      if (!overrides.mockClient) {
        throw new Error(
          "createTestContext: provide mockClient to use createExecutorContext in tests",
        );
      }
      return { client: overrides.mockClient };
    },
    getToken(): string {
      if (overrides.token) return overrides.token;
      if (typeof opts.token === "string") return opts.token;
      return "test-token";
    },
  };
}
