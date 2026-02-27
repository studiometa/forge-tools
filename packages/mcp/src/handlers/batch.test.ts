import { describe, expect, it } from "vitest";

import type { CommonArgs, HandlerContext, ToolResult } from "./types.ts";
import { handleBatch } from "./batch.ts";
import { errorResult, jsonResult } from "./utils.ts";

const mockRouteToHandler = async (
  resource: string,
  action: string,
  _args: CommonArgs,
  _ctx: HandlerContext,
): Promise<ToolResult> => {
  if (resource === "fail") throw new Error("Mock failure");
  return jsonResult({ resource, action, mock: true });
};

const mockCtx: HandlerContext = {
  executorContext: { client: {} as never },
  compact: true,
};

describe("handleBatch", () => {
  it("should return error for unknown action", async () => {
    const result = await handleBatch("list", {} as CommonArgs, mockCtx, mockRouteToHandler);
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain('"list"');
    expect(result.content[0]!.text).toContain("run");
  });

  it("should return error when operations is missing", async () => {
    const result = await handleBatch(
      "run",
      { resource: "batch", action: "run" } as CommonArgs,
      mockCtx,
      mockRouteToHandler,
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("operations");
  });

  it("should return error when operations is not an array", async () => {
    const result = await handleBatch(
      "run",
      { resource: "batch", action: "run", operations: "not-an-array" } as CommonArgs,
      mockCtx,
      mockRouteToHandler,
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain('"operations" must be an array');
  });

  it("should return error when operations exceeds max (11 ops)", async () => {
    const operations = Array.from({ length: 11 }, () => ({
      resource: "servers",
      action: "list",
    }));
    const result = await handleBatch(
      "run",
      { resource: "batch", action: "run", operations } as CommonArgs,
      mockCtx,
      mockRouteToHandler,
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("Too many operations");
    expect(result.content[0]!.text).toContain("11");
    expect(result.content[0]!.text).toContain("10");
  });

  it("should succeed with empty operations array", async () => {
    const result = await handleBatch(
      "run",
      { resource: "batch", action: "run", operations: [] } as CommonArgs,
      mockCtx,
      mockRouteToHandler,
    );
    expect(result.isError).toBeUndefined();
    const data = JSON.parse(result.content[0]!.text);
    expect(data._batch.total).toBe(0);
    expect(data._batch.succeeded).toBe(0);
    expect(data._batch.failed).toBe(0);
    expect(data.results).toEqual([]);
  });

  it("should return error when operation is not an object", async () => {
    const result = await handleBatch(
      "run",
      {
        resource: "batch",
        action: "run",
        operations: [null],
      } as CommonArgs,
      mockCtx,
      mockRouteToHandler,
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("must be an object");
  });

  it("should return error when operation is missing resource field", async () => {
    const result = await handleBatch(
      "run",
      {
        resource: "batch",
        action: "run",
        operations: [{ action: "list" }],
      } as CommonArgs,
      mockCtx,
      mockRouteToHandler,
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain('"resource"');
    expect(result.content[0]!.text).toContain("index 0");
  });

  it("should return error when operation is missing action field", async () => {
    const result = await handleBatch(
      "run",
      {
        resource: "batch",
        action: "run",
        operations: [{ resource: "servers" }],
      } as CommonArgs,
      mockCtx,
      mockRouteToHandler,
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain('"action"');
    expect(result.content[0]!.text).toContain("index 0");
  });

  it("should reject write action in an operation", async () => {
    const result = await handleBatch(
      "run",
      {
        resource: "batch",
        action: "run",
        operations: [{ resource: "servers", action: "create" }],
      } as CommonArgs,
      mockCtx,
      mockRouteToHandler,
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain('"create"');
    expect(result.content[0]!.text).toContain("read actions");
  });

  it("should execute multiple operations successfully", async () => {
    const result = await handleBatch(
      "run",
      {
        resource: "batch",
        action: "run",
        operations: [
          { resource: "servers", action: "list" },
          { resource: "sites", action: "list", server_id: "123" },
          { resource: "databases", action: "list", server_id: "123" },
        ],
      } as CommonArgs,
      mockCtx,
      mockRouteToHandler,
    );
    expect(result.isError).toBeUndefined();
    const data = JSON.parse(result.content[0]!.text);
    expect(data._batch.total).toBe(3);
    expect(data._batch.succeeded).toBe(3);
    expect(data._batch.failed).toBe(0);
    expect(data.results).toHaveLength(3);
    expect(data.results[0].resource).toBe("servers");
    expect(data.results[0].action).toBe("list");
    expect(data.results[0].index).toBe(0);
    expect(data.results[0].data).toBeDefined();
    expect(data.results[1].resource).toBe("sites");
  });

  it("should isolate partial failure (one op throws, one succeeds)", async () => {
    const result = await handleBatch(
      "run",
      {
        resource: "batch",
        action: "run",
        operations: [
          { resource: "servers", action: "list" },
          { resource: "fail", action: "list" },
        ],
      } as CommonArgs,
      mockCtx,
      mockRouteToHandler,
    );
    expect(result.isError).toBeUndefined();
    const data = JSON.parse(result.content[0]!.text);
    expect(data._batch.total).toBe(2);
    expect(data._batch.succeeded).toBe(1);
    expect(data._batch.failed).toBe(1);
    expect(data.results[0].data).toBeDefined();
    expect(data.results[0].error).toBeUndefined();
    expect(data.results[1].error).toContain("Mock failure");
    expect(data.results[1].data).toBeUndefined();
  });

  it("should include correct _batch summary counts", async () => {
    const mockWithError = async (
      resource: string,
      action: string,
      _args: CommonArgs,
      _ctx: HandlerContext,
    ): Promise<ToolResult> => {
      if (resource === "fail") throw new Error("Mock failure");
      if (resource === "err") return errorResult("Returned error");
      return jsonResult({ resource, action, mock: true });
    };

    const result = await handleBatch(
      "run",
      {
        resource: "batch",
        action: "run",
        operations: [
          { resource: "servers", action: "list" },
          { resource: "fail", action: "list" },
          { resource: "err", action: "list" },
          { resource: "sites", action: "list", server_id: "1" },
        ],
      } as CommonArgs,
      mockCtx,
      mockWithError,
    );
    expect(result.isError).toBeUndefined();
    const data = JSON.parse(result.content[0]!.text);
    expect(data._batch.total).toBe(4);
    expect(data._batch.succeeded).toBe(2);
    expect(data._batch.failed).toBe(2);
  });

  it("should handle operation result without structuredContent", async () => {
    const mockNoStructured = async (): Promise<ToolResult> => ({
      content: [{ type: "text", text: "plain text result" }],
    });

    const result = await handleBatch(
      "run",
      {
        resource: "batch",
        action: "run",
        operations: [{ resource: "servers", action: "list" }],
      } as CommonArgs,
      mockCtx,
      mockNoStructured,
    );
    expect(result.isError).toBeUndefined();
    const data = JSON.parse(result.content[0]!.text);
    expect(data._batch.succeeded).toBe(1);
    expect(data.results[0].data).toBe("plain text result");
  });

  it("should handle error result without structuredContent", async () => {
    const mockErrorNoStructured = async (): Promise<ToolResult> => ({
      content: [{ type: "text", text: "Error: something broke" }],
      isError: true,
    });

    const result = await handleBatch(
      "run",
      {
        resource: "batch",
        action: "run",
        operations: [{ resource: "servers", action: "list" }],
      } as CommonArgs,
      mockCtx,
      mockErrorNoStructured,
    );
    expect(result.isError).toBeUndefined();
    const data = JSON.parse(result.content[0]!.text);
    expect(data._batch.failed).toBe(1);
    expect(data.results[0].error).toBe("Error: something broke");
  });

  it("should handle non-Error rejection reason", async () => {
    const mockStringReject = async (): Promise<ToolResult> => {
      throw "string rejection";
    };

    const result = await handleBatch(
      "run",
      {
        resource: "batch",
        action: "run",
        operations: [{ resource: "servers", action: "list" }],
      } as CommonArgs,
      mockCtx,
      mockStringReject,
    );
    expect(result.isError).toBeUndefined();
    const data = JSON.parse(result.content[0]!.text);
    expect(data._batch.failed).toBe(1);
    expect(data.results[0].error).toBe("string rejection");
  });

  it("should allow exactly 10 operations (at the limit)", async () => {
    const operations = Array.from({ length: 10 }, () => ({
      resource: "servers",
      action: "list",
    }));
    const result = await handleBatch(
      "run",
      { resource: "batch", action: "run", operations } as CommonArgs,
      mockCtx,
      mockRouteToHandler,
    );
    expect(result.isError).toBeUndefined();
    const data = JSON.parse(result.content[0]!.text);
    expect(data._batch.total).toBe(10);
    expect(data._batch.succeeded).toBe(10);
  });
});
