/**
 * Batch handler — executes multiple read operations in a single MCP call.
 *
 * Reduces round-trips for AI agents by running operations in parallel
 * with Promise.allSettled, isolating per-operation failures.
 */

import type { CommonArgs, HandlerContext, ToolResult } from "./types.ts";

import { isReadAction } from "../tools.ts";
import { errorResult, jsonResult } from "./utils.ts";

type RouteHandler = (
  resource: string,
  action: string,
  args: CommonArgs,
  ctx: HandlerContext,
) => Promise<ToolResult>;

const MAX_OPERATIONS = 10;

/**
 * Handle batch action — executes multiple read operations in parallel.
 */
export async function handleBatch(
  action: string,
  args: CommonArgs,
  ctx: HandlerContext,
  routeToHandler: RouteHandler,
): Promise<ToolResult> {
  if (action !== "run") {
    return errorResult(`Unknown action "${action}" for batch resource. Only "run" is supported.`);
  }

  const { operations } = args;

  if (operations === undefined || operations === null) {
    return errorResult('Missing required field: "operations". Provide an array of operations.');
  }

  if (!Array.isArray(operations)) {
    return errorResult('"operations" must be an array of operation objects.');
  }

  if (operations.length > MAX_OPERATIONS) {
    return errorResult(
      `Too many operations: ${operations.length}. Maximum is ${MAX_OPERATIONS} per batch.`,
    );
  }

  // Validate each operation
  for (let i = 0; i < operations.length; i++) {
    const op = operations[i] as Record<string, unknown>;
    if (!op || typeof op !== "object") {
      return errorResult(`Operation at index ${i} must be an object.`);
    }
    if (!op["resource"] || typeof op["resource"] !== "string") {
      return errorResult(`Operation at index ${i} is missing required field "resource".`);
    }
    if (!op["action"] || typeof op["action"] !== "string") {
      return errorResult(`Operation at index ${i} is missing required field "action".`);
    }
    if (!isReadAction(op["action"] as string)) {
      return errorResult(
        `Operation at index ${i} has invalid action "${op["action"]}". Only read actions are allowed in batch: list, get, help, schema.`,
      );
    }
  }

  // Execute all operations in parallel
  const settled = await Promise.allSettled(
    operations.map((op) => {
      const { resource, action: opAction, ...rest } = op as Record<string, unknown>;
      return routeToHandler(
        resource as string,
        opAction as string,
        { resource: resource as string, action: opAction as string, ...rest } as CommonArgs,
        ctx,
      );
    }),
  );

  // Aggregate results
  let succeeded = 0;
  let failed = 0;

  const results = settled.map((outcome, index) => {
    const op = operations[index] as Record<string, unknown>;
    const resource = op["resource"] as string;
    const opAction = op["action"] as string;

    if (outcome.status === "fulfilled") {
      const toolResult = outcome.value;
      if (toolResult.isError) {
        failed++;
        return {
          index,
          resource,
          action: opAction,
          error:
            toolResult.structuredContent?.["error"] ??
            /* v8 ignore next */
            toolResult.content[0]?.text ??
            "Unknown error",
        };
      }
      succeeded++;
      return {
        index,
        resource,
        action: opAction,
        data: toolResult.structuredContent?.["result"] ?? toolResult.content[0]?.text,
      };
    } else {
      failed++;
      return {
        index,
        resource,
        action: opAction,
        error: outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason),
      };
    }
  });

  return jsonResult({
    _batch: {
      total: operations.length,
      succeeded,
      failed,
    },
    results,
  });
}
