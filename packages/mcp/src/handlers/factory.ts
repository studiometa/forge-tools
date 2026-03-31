/**
 * Factory for creating Forge resource handlers.
 *
 * Encapsulates the repetitive list/get/create/update/delete pattern
 * shared by all MCP resource handlers.
 */

import * as v from "valibot";
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

  /**
   * Valibot schemas for input validation per action.
   * When provided, args are validated through the schema before calling the executor.
   */
  inputSchemas?: Record<string, v.GenericSchema>;

  /** Executor functions keyed by action name */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- contravariant: executors accept specific option subtypes
  executors: Record<
    string,
    (options: any, ctx: ExecutorContext) => Promise<ExecutorResult<unknown>>
  >;

  /**
   * Generate contextual hints for the get action response.
   */
  hints?: (data: unknown, id: string, args: CommonArgs) => ContextualHints;

  /** Map tool args to executor options. Defaults to pass-through. */
  mapOptions?: (action: string, args: CommonArgs) => Record<string, unknown>;

  /**
   * Format the executor result data into human-readable text for MCP output.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- data type varies per resource/action
  formatResult?: (action: string, data: any, args: CommonArgs) => string;
}

/**
 * Format Valibot validation issues into field-level error messages.
 */
function formatValidationIssues(issues: v.BaseIssue<unknown>[]): string {
  return issues
    .map((issue) => {
      const path = issue.path?.map((p) => p.key).join(".") || "(root)";
      return `${path}: ${issue.message}`;
    })
    .join(", ");
}

/**
 * Create a resource handler from configuration.
 */
export function createResourceHandler(
  config: ResourceHandlerConfig,
): (action: string, args: CommonArgs, ctx: HandlerContext) => Promise<ToolResult> {
  const {
    resource,
    actions,
    inputSchemas = {},
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

    // Validate input through Valibot schema if available
    const schema = inputSchemas[action];
    if (schema) {
      const parsed = v.safeParse(schema, args);
      if (!parsed.success) {
        return errorResult(`Invalid input: ${formatValidationIssues(parsed.issues)}`);
      }
    }

    // Validate ID-like fields to prevent path traversal
    for (const field of ["id", "server_id", "site_id"]) {
      const value = args[field];
      const idStr = typeof value === "string" || typeof value === "number" ? String(value) : "";
      if (value !== undefined && !sanitizeId(idStr)) {
        return errorResult(`Invalid ${field}: "${idStr}". IDs must be alphanumeric.`);
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
    const result = await executor(options, ctx.executorContext);

    // Format result
    if (result.data === undefined) {
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
        ...(typeof result.data === "object" && result.data !== null
          ? (result.data as Record<string, unknown>)
          : {}),
        _hints: hints(result.data, String(id), args),
      };
      return jsonResult(responseData);
    }

    return jsonResult(result.data);
  };
}
