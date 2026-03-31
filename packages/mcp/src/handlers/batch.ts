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

/** A validated batch operation. */
interface BatchOperation {
  resource: string;
  action: string;
  [key: string]: unknown;
}

const MAX_OPERATIONS = 10;

/**
 * Validate and narrow an array element to a BatchOperation.
 * Returns an error message string on failure, or the typed operation on success.
 */
function validateOperation(
  op: unknown,
  index: number,
): { ok: true; value: BatchOperation } | { ok: false; error: string } {
  if (!op || typeof op !== "object") {
    return { ok: false, error: `Operation at index ${index} must be an object.` };
  }
  const record = op as Record<string, unknown>;
  if (!record["resource"] || typeof record["resource"] !== "string") {
    return {
      ok: false,
      error: `Operation at index ${index} is missing required field "resource".`,
    };
  }
  if (!record["action"] || typeof record["action"] !== "string") {
    return { ok: false, error: `Operation at index ${index} is missing required field "action".` };
  }
  if (!isReadAction(record["action"])) {
    return {
      ok: false,
      error: `Operation at index ${index} has invalid action "${record["action"]}". Only read actions are allowed in batch: list, get, help, schema.`,
    };
  }
  return { ok: true, value: record as BatchOperation };
}

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

  // Validate and narrow all operations upfront
  const validated: BatchOperation[] = [];
  for (let i = 0; i < operations.length; i++) {
    const result = validateOperation(operations[i], i);
    if (!result.ok) {
      return errorResult(result.error);
    }
    validated.push(result.value);
  }

  // Execute all operations in parallel
  const settled = await Promise.allSettled(
    validated.map((op) => {
      const { resource, action: opAction, ...rest } = op;
      return routeToHandler(resource, opAction, { resource, action: opAction, ...rest }, ctx);
    }),
  );

  // Aggregate results
  let succeeded = 0;
  let failed = 0;

  const results = settled.map((outcome, index) => {
    const { resource, action: opAction } = validated[index];

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
      total: validated.length,
      succeeded,
      failed,
    },
    results,
  });
}
