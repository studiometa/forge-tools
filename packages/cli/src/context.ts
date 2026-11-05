/**
 * CLI execution context with dependency injection.
 *
 * Instead of hidden dependencies in command handlers, this module provides
 * explicit dependency passing for testability and transparency.
 */

import type { HttpClient } from "@studiometa/forge-api";
import type { ExecutorContext } from "@studiometa/forge-core";

import { type OutputFormat, isOutputFormat } from "./types.ts";

import { HttpClient as ForgeHttpClient } from "@studiometa/forge-api";
import { ConfigError } from "./errors.ts";
import { createConfigStore, getToken, getOrganizationSlug } from "./config.ts";
import { OutputFormatter } from "./output.ts";

/**
 * Executor context of the CLI. It also tells the resolvers of --server and --site
 * how to match names.
 */
export interface CliExecutorContext extends ExecutorContext {
  /** Accept only a numeric ID or an exact name (`--exact` or `FORGE_EXACT_MATCH=1`). */
  readonly exactMatch: boolean;
}

export interface CommandOptions {
  [key: string]: string | boolean | string[] | undefined;
  format?: string;
  f?: string;
  token?: string;
  "no-color"?: boolean;
  exact?: boolean;
}

/**
 * Whether --server and --site must match an exact name: the `--exact` flag or the
 * `FORGE_EXACT_MATCH` environment variable (`1` or `true`) turns it on.
 */
export function isExactMatch(
  options: CommandOptions,
  env: Record<string, string | undefined> = process.env,
): boolean {
  const value = env.FORGE_EXACT_MATCH?.trim().toLowerCase();
  return options.exact === true || value === "1" || value === "true";
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
  createExecutorContext(token: string): CliExecutorContext;
  /** Resolve the API token or throw ConfigError */
  getToken(): string;
}

/**
 * Creates a command context from CLI options.
 */
export function createContext(options: CommandOptions = {}): CommandContext {
  const rawFormat = options.format ?? options.f ?? "human";
  const format: OutputFormat = isOutputFormat(rawFormat) ? rawFormat : "human";
  const noColor = options["no-color"] === true;
  const formatter = new OutputFormatter(format, noColor);
  const exactMatch = isExactMatch(options);

  return {
    formatter,
    options,

    createExecutorContext(token: string): CliExecutorContext {
      const client: HttpClient = new ForgeHttpClient({ token });
      const orgSlug =
        (typeof options.org === "string" && options.org) ||
        getOrganizationSlug(createConfigStore()) ||
        undefined;
      return { client, organizationSlug: orgSlug, exactMatch };
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
  const rawFormat = opts.format ?? "json";
  const format: OutputFormat = isOutputFormat(rawFormat) ? rawFormat : "json";
  const formatter = overrides.formatter ?? new OutputFormatter(format, true);

  return {
    formatter,
    options: opts,
    createExecutorContext(_token: string): CliExecutorContext {
      if (!overrides.mockClient) {
        throw new Error(
          "createTestContext: provide mockClient to use createExecutorContext in tests",
        );
      }
      return {
        client: overrides.mockClient,
        organizationSlug: "test-org",
        exactMatch: isExactMatch(opts, {}),
      };
    },
    getToken(): string {
      if (overrides.token) return overrides.token;
      if (typeof opts.token === "string") return opts.token;
      return "test-token";
    },
  };
}
