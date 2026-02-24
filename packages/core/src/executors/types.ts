/**
 * Shared executor types.
 *
 * Executors are pure business logic functions:
 *   (options, context) → ExecutorResult<T>
 *
 * They never do I/O side effects (no console.log, no spinners, no process.exit).
 * Adapters (CLI, MCP) handle all I/O concerns.
 */

import type { ExecutorContext, ExecutorResult } from "../context.ts";

/**
 * Generic executor function signature.
 *
 * @template TOptions - The shape of the options object
 * @template TData - The shape of the data payload
 */
export type Executor<TOptions, TData> = (
  options: TOptions,
  context: ExecutorContext,
) => Promise<ExecutorResult<TData>>;
