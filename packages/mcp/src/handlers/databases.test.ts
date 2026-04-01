import { describe, expect, it } from "vitest";

import { mockDocument, mockListDocument } from "@studiometa/forge-core";

import type { HandlerContext } from "./types.ts";

import { handleDatabases } from "./databases.ts";

function makeDbAttrs(overrides: Record<string, unknown> = {}) {
  return {
    name: "myapp",
    status: "installed",
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    ...overrides,
  };
}

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      organizationSlug: "test-org",
      client: {
        get: async (url: string) => {
          if (/\/database\/schemas\/\d+$/.test(url)) {
            return mockDocument(1, "databases", makeDbAttrs());
          }
          return mockListDocument("databases", [{ id: 1, attributes: makeDbAttrs() as never }]);
        },
        post: async () =>
          mockDocument(2, "databases", makeDbAttrs({ name: "newdb", status: "creating" })),
        delete: async () => {},
      } as never,
    },
    compact: true,
  };
}

describe("handleDatabases", () => {
  it("should list databases", async () => {
    const result = await handleDatabases(
      "list",
      { resource: "databases", action: "list", server_id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("myapp");
  });

  it("should get a database", async () => {
    const result = await handleDatabases(
      "get",
      { resource: "databases", action: "get", server_id: "1", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("myapp");
  });

  it("should create a database", async () => {
    const result = await handleDatabases(
      "create",
      { resource: "databases", action: "create", server_id: "1", name: "newdb" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("newdb");
  });

  it("should delete a database", async () => {
    const result = await handleDatabases(
      "delete",
      { resource: "databases", action: "delete", server_id: "1", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("deleted");
  });

  it("should require server_id for list", async () => {
    const result = await handleDatabases(
      "list",
      { resource: "databases", action: "list" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
  });

  it("should handle unknown action", async () => {
    const result = await handleDatabases(
      "unknown",
      { resource: "databases", action: "unknown", server_id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
  });

  it("should inject hints on get when includeHints=true", async () => {
    const ctx = createMockContext();
    ctx.compact = false;
    ctx.includeHints = true;

    const result = await handleDatabases(
      "get",
      { resource: "databases", action: "get", server_id: "1", id: "1" },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed._hints).toBeDefined();
    expect(parsed._hints.related_resources).toBeDefined();
  });
});
