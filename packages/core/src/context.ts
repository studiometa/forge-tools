import type { HttpClient } from "@studiometa/forge-api";

/**
 * Execution context injected into all executors.
 *
 * Provides access to the HTTP client and other dependencies.
 * Uses DI for testability — tests inject mocks via `createTestExecutorContext()`.
 */
export interface ExecutorContext {
  /** HTTP client for Forge API calls. */
  client: HttpClient;
}

/**
 * Result of an executor function.
 */
export interface ExecutorResult<T> {
  /** The response data. */
  data: T;
  /** Human-readable formatted text for MCP output. */
  text: string;
}

/**
 * Create a test executor context with a mock HTTP client.
 *
 * @param overrides Partial overrides for the context.
 */
export function createTestExecutorContext(
  overrides: Partial<ExecutorContext> = {},
): ExecutorContext {
  const defaultClient = new Proxy({} as HttpClient, {
    get: (_target, prop) => {
      return (..._args: unknown[]) => {
        throw new Error(
          `HttpClient.${String(prop)}() called without mock — inject a mock client in createTestExecutorContext()`,
        );
      };
    },
  });

  return {
    client: defaultClient,
    ...overrides,
  };
}
