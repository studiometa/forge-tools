/**
 * Factory for creating Forge resource handlers.
 *
 * Encapsulates the repetitive list/get/create/update/delete pattern
 * shared by all MCP resource handlers.
 */

import type { ExecutorContext, ExecutorResult } from "@studiometa/forge-core";

import type { ContextualHints } from "../hints.ts";
import type { CommonArgs, HandlerContext, ToolResult } from "./types.ts";

import { errorResult, jsonResult, sanitizeId } from "./utils.ts";

/**
 * Configuration for a resource handler.
 */
export interface ResourceHandlerConfig {
  /** Resource name for error messages */
  resource: string;

  /** Valid actions for this resource */
  actions: string[];

  /** Fields required per action (in addition to defaults) */
  requiredFields?: Record<string, string[]>;

  /** Executor functions keyed by action name */
  // biome-ignore lint: executor signatures vary per resource
  executors: Record<
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (options: any, ctx: ExecutorContext) => Promise<ExecutorResult<unknown>>
  >;

  /**
   * Generate contextual hints for the get action response.
   *
   * Called with the executor result data and the resource id.
   * Only injected when `ctx.includeHints` is true.
   */
  hints?: (data: unknown, id: string) => ContextualHints;

  /** Map tool args to executor options. Defaults to pass-through. */
  mapOptions?: (action: string, args: CommonArgs) => Record<string, unknown>;

  /**
   * Format the executor result data into human-readable text for MCP output.
   *
   * Called with the executor result data and the tool args when compact mode
   * is enabled. If not provided, the data is JSON-serialized.
   */
  // biome-ignore lint: formatter signatures vary per resource
  formatResult?: (action: string, data: any, args: CommonArgs) => string;
}

/**
 * Create a resource handler from configuration.
 *
 * Returns a function that routes actions to the correct executor,
 * validates required fields, and formats results.
 *
 * @example
 * ```typescript
 * export const handleDatabases = createResourceHandler({
 *   resource: 'databases',
 *   actions: ['list', 'get', 'create', 'delete'],
 *   requiredFields: {
 *     list: ['server_id'],
 *     get: ['server_id', 'id'],
 *     create: ['server_id', 'name'],
 *     delete: ['server_id', 'id'],
 *   },
 *   executors: {
 *     list: listDatabases,
 *     get: getDatabase,
 *     create: createDatabase,
 *     delete: deleteDatabase,
 *   },
 *   formatResult: (action, data) => {
 *     if (action === 'list') return formatDatabaseList(data);
 *     if (action === 'get') return formatDatabase(data);
 *     return 'Done.';
 *   },
 * });
 * ```
 */
export function createResourceHandler(
  config: ResourceHandlerConfig,
): (action: string, args: CommonArgs, ctx: HandlerContext) => Promise<ToolResult> {
  const {
    resource,
    actions,
    requiredFields = {},
    executors,
    hints,
    mapOptions,
    formatResult,
  } = config;

  return async (action: string, args: CommonArgs, ctx: HandlerContext): Promise<ToolResult> => {
    // Validate action
    if (!actions.includes(action)) {
      return errorResult(
        `Unknown action "${action}" for ${resource}. Valid actions: ${actions.join(", ")}.`,
      );
    }

    // Check required fields
    const required = requiredFields[action] ?? [];
    for (const field of required) {
      if (!args[field]) {
        return errorResult(`Missing required field: ${field}`);
      }
    }

    // Validate ID-like fields to prevent path traversal
    for (const field of ["id", "server_id", "site_id"]) {
      const value = args[field];
      if (value !== undefined && !sanitizeId(String(value))) {
        return errorResult(`Invalid ${field}: "${value}". IDs must be alphanumeric.`);
      }
    }

    // Get executor
    const executor = executors[action];
    if (!executor) {
      return errorResult(`Action "${action}" is not yet implemented for ${resource}.`);
    }

    // Map args to executor options — strip MCP-specific fields from passthrough
    let options: Record<string, unknown>;
    if (mapOptions) {
      options = mapOptions(action, args);
    } else {
      const { resource: _r, action: _a, compact: _c, ...rest } = args;
      options = rest;
    }

    // Execute
    const result = await executor(options as Record<string, unknown>, ctx.executorContext);

    // Format result
    if (result.data === undefined) {
      // Void result (delete, activate, etc.) — use formatter or generic message
      const text = formatResult ? formatResult(action, undefined, args) : "Done.";
      return jsonResult(text);
    }

    if (ctx.compact && formatResult) {
      return jsonResult(formatResult(action, result.data, args));
    }

    // For non-compact get responses, inject contextual hints when enabled
    if (action === "get" && ctx.includeHints && hints) {
      /* v8 ignore start */
      const id = args.id ?? args.server_id ?? "";
      /* v8 ignore stop */
      const responseData = {
        ...(result.data as Record<string, unknown>),
        _hints: hints(result.data, String(id)),
      };
      return jsonResult(responseData);
    }

    return jsonResult(result.data);
  };
}
