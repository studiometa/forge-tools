import { describe, expect, it } from "vitest";

import type { ExecutorContext, ExecutorResult } from "@studiometa/forge-core";

import type { ContextualHints } from "../hints.ts";
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
      executors: { list: async () => ({ data: [] }) },
    });

    const result = await handler("list", { resource: "test", action: "list" }, createMockContext());
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("server_id");
  });

  it("should execute and return formatted text when compact and formatResult provided", async () => {
    const handler = createResourceHandler({
      resource: "test",
      actions: ["list"],
      executors: {
        list: async (): Promise<ExecutorResult<string[]>> => ({
          data: ["a", "b"],
        }),
      },
      formatResult: () => "2 items found",
    });

    const result = await handler("list", { resource: "test", action: "list" }, createMockContext());
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toBe("2 items found");
  });

  it("should return JSON data when compact but no formatResult", async () => {
    const handler = createResourceHandler({
      resource: "test",
      actions: ["list"],
      executors: {
        list: async (): Promise<ExecutorResult<string[]>> => ({
          data: ["a", "b"],
        }),
      },
    });

    const result = await handler("list", { resource: "test", action: "list" }, createMockContext());
    expect(result.isError).toBeUndefined();
    // Without formatResult, falls through to JSON
    const parsed = JSON.parse(result.content[0]!.text);
    expect(Array.isArray(parsed)).toBe(true);
  });

  it("should return data when not compact", async () => {
    const handler = createResourceHandler({
      resource: "test",
      actions: ["get"],
      executors: {
        get: async (): Promise<ExecutorResult<{ id: number }>> => ({
          data: { id: 1 },
        }),
      },
      formatResult: () => "Item 1",
    });

    const ctx = createMockContext();
    ctx.compact = false;
    const result = await handler("get", { resource: "test", action: "get" }, ctx);
    expect(result.content[0]!.text).toContain('"id": 1');
  });

  it("should handle void result (data undefined) with formatResult", async () => {
    const handler = createResourceHandler({
      resource: "test",
      actions: ["delete"],
      executors: {
        delete: async (): Promise<ExecutorResult<void>> => ({
          data: undefined,
        }),
      },
      formatResult: () => "Deleted successfully",
    });

    const result = await handler(
      "delete",
      { resource: "test", action: "delete" },
      createMockContext(),
    );
    expect(result.content[0]!.text).toContain("Deleted successfully");
  });

  it("should handle void result (data undefined) with default message when no formatResult", async () => {
    const handler = createResourceHandler({
      resource: "test",
      actions: ["delete"],
      executors: {
        delete: async (): Promise<ExecutorResult<void>> => ({
          data: undefined,
        }),
      },
    });

    const result = await handler(
      "delete",
      { resource: "test", action: "delete" },
      createMockContext(),
    );
    expect(result.content[0]!.text).toBe("Done.");
  });

  it("should return not implemented for listed but missing executor", async () => {
    const handler = createResourceHandler({
      resource: "test",
      actions: ["list", "create"],
      executors: {
        list: async (): Promise<ExecutorResult<string[]>> => ({
          data: [],
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
    let capturedOpts: Record<string, unknown> = {};
    const handler = createResourceHandler({
      resource: "test",
      actions: ["list"],
      executors: {
        list: async (opts: Record<string, unknown>): Promise<ExecutorResult<string[]>> => {
          capturedOpts = opts;
          return { data: [] };
        },
      },
      formatResult: (_action, _data, args) => `server=${args.server_id}`,
    });

    const result = await handler(
      "list",
      { resource: "test", action: "list", server_id: "42" },
      createMockContext(),
    );
    expect(result.content[0]!.text).toContain("server=42");
    expect(capturedOpts.server_id).toBe("42");
  });

  it("should pass args to formatResult for void actions", async () => {
    const handler = createResourceHandler({
      resource: "test",
      actions: ["delete"],
      executors: {
        delete: async (): Promise<ExecutorResult<void>> => ({ data: undefined }),
      },
      formatResult: (_action, _data, args) => `Resource ${args.id} deleted.`,
    });

    const result = await handler(
      "delete",
      { resource: "test", action: "delete", id: "99" },
      createMockContext(),
    );
    expect(result.content[0]!.text).toBe("Resource 99 deleted.");
  });

  it("should inject _hints when action=get, ctx.includeHints=true, and hints config provided", async () => {
    const mockHints: ContextualHints = {
      related_resources: [{ resource: "other", description: "desc", example: {} }],
    };
    const handler = createResourceHandler({
      resource: "test",
      actions: ["get"],
      executors: {
        get: async (): Promise<ExecutorResult<{ id: number }>> => ({ data: { id: 1 } }),
      },
      hints: (_data, id) => ({ ...mockHints, common_actions: [{ action: id, example: {} }] }),
    });

    const ctx = createMockContext();
    ctx.compact = false;
    ctx.includeHints = true;

    const result = await handler("get", { resource: "test", action: "get", id: "1" }, ctx);
    const parsed = JSON.parse(result.content[0]!.text);
    expect(parsed._hints).toBeDefined();
    expect(parsed._hints.related_resources[0].resource).toBe("other");
    expect(parsed._hints.common_actions[0].action).toBe("1");
    expect(parsed.id).toBe(1);
  });

  it("should not inject _hints when hints config is provided but ctx.includeHints is false", async () => {
    const handler = createResourceHandler({
      resource: "test",
      actions: ["get"],
      executors: {
        get: async (): Promise<ExecutorResult<{ id: number }>> => ({ data: { id: 2 } }),
      },
      hints: () => ({ related_resources: [] }),
    });

    const ctx = createMockContext();
    ctx.compact = false;
    ctx.includeHints = false;

    const result = await handler("get", { resource: "test", action: "get", id: "2" }, ctx);
    const parsed = JSON.parse(result.content[0]!.text);
    expect(parsed._hints).toBeUndefined();
    expect(parsed.id).toBe(2);
  });

  it("should not inject _hints when hints config is not provided", async () => {
    const handler = createResourceHandler({
      resource: "test",
      actions: ["get"],
      executors: {
        get: async (): Promise<ExecutorResult<{ id: number }>> => ({ data: { id: 3 } }),
      },
    });

    const ctx = createMockContext();
    ctx.compact = false;
    ctx.includeHints = true;

    const result = await handler("get", { resource: "test", action: "get", id: "3" }, ctx);
    const parsed = JSON.parse(result.content[0]!.text);
    expect(parsed._hints).toBeUndefined();
    expect(parsed.id).toBe(3);
  });

  it("should use server_id as id for hints when args.id is missing", async () => {
    let capturedId = "";
    const handler = createResourceHandler({
      resource: "test",
      actions: ["get"],
      executors: {
        get: async (): Promise<ExecutorResult<{ server_id: number }>> => ({
          data: { server_id: 5 },
        }),
      },
      hints: (_data, id) => {
        capturedId = id;
        return {};
      },
    });

    const ctx = createMockContext();
    ctx.compact = false;
    ctx.includeHints = true;

    await handler("get", { resource: "test", action: "get", server_id: "5" }, ctx);
    expect(capturedId).toBe("5");
  });
});
