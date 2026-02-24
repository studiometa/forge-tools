import { describe, expect, it } from "vitest";

import type { ExecutorContext, ExecutorResult } from "@studiometa/forge-core";

import type { HandlerContext } from "./types.ts";

import { createResourceHandler } from "./factory.ts";

function createMockContext(): HandlerContext {
  const mockClient = {
    get: async () => ({}),
    post: async () => ({}),
    put: async () => ({}),
    delete: async () => ({}),
  } as unknown as ExecutorContext["client"];

  return {
    executorContext: { client: mockClient },
    compact: true,
  };
}

describe("createResourceHandler", () => {
  it("should validate unknown actions", async () => {
    const handler = createResourceHandler({
      resource: "test",
      actions: ["list"],
      executors: {},
    });

    const result = await handler("get", { resource: "test", action: "get" }, createMockContext());
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("Unknown action");
  });

  it("should validate required fields", async () => {
    const handler = createResourceHandler({
      resource: "test",
      actions: ["list"],
      requiredFields: { list: ["server_id"] },
      executors: { list: async () => ({ data: [], text: "ok" }) },
    });

    const result = await handler("list", { resource: "test", action: "list" }, createMockContext());
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("server_id");
  });

  it("should execute and return compact text", async () => {
    const handler = createResourceHandler({
      resource: "test",
      actions: ["list"],
      executors: {
        list: async (): Promise<ExecutorResult<string[]>> => ({
          data: ["a", "b"],
          text: "2 items found",
        }),
      },
    });

    const result = await handler("list", { resource: "test", action: "list" }, createMockContext());
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toBe("2 items found");
  });

  it("should return data when not compact", async () => {
    const handler = createResourceHandler({
      resource: "test",
      actions: ["get"],
      executors: {
        get: async (): Promise<ExecutorResult<{ id: 1 }>> => ({
          data: { id: 1 },
          text: "Item 1",
        }),
      },
    });

    const ctx = createMockContext();
    ctx.compact = false;
    const result = await handler("get", { resource: "test", action: "get" }, ctx);
    expect(result.content[0]!.text).toContain('"id": 1');
  });

  it("should handle void result (data undefined)", async () => {
    const handler = createResourceHandler({
      resource: "test",
      actions: ["delete"],
      executors: {
        delete: async (): Promise<ExecutorResult<void>> => ({
          data: undefined,
          text: "Deleted successfully",
        }),
      },
    });

    const result = await handler(
      "delete",
      { resource: "test", action: "delete" },
      createMockContext(),
    );
    expect(result.content[0]!.text).toContain("Deleted successfully");
  });

  it("should return not implemented for listed but missing executor", async () => {
    const handler = createResourceHandler({
      resource: "test",
      actions: ["list", "create"],
      executors: {
        list: async (): Promise<ExecutorResult<string[]>> => ({
          data: [],
          text: "ok",
        }),
        // "create" is in actions but has no executor
      },
    });

    const result = await handler(
      "create",
      { resource: "test", action: "create" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("not yet implemented");
  });

  it("should use default args passthrough when no mapOptions", async () => {
    const handler = createResourceHandler({
      resource: "test",
      actions: ["list"],
      executors: {
        list: async (opts: Record<string, unknown>): Promise<ExecutorResult<string[]>> => ({
          data: [],
          text: `server=${opts.server_id}`,
        }),
      },
    });

    const result = await handler(
      "list",
      { resource: "test", action: "list", server_id: "42" },
      createMockContext(),
    );
    expect(result.content[0]!.text).toContain("server=42");
  });
});
