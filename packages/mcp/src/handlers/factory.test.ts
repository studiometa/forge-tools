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
});
