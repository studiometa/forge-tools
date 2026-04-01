import { describe, expect, it } from "vitest";

import { mockDocument, mockListDocument } from "@studiometa/forge-core";

import type { HandlerContext } from "./types.ts";

import { handleDatabaseUsers } from "./database-users.ts";

function makeUserAttrs(overrides: Record<string, unknown> = {}) {
  return {
    name: "forge",
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
          if (/\/database\/users\/\d+$/.test(url)) {
            return mockDocument(1, "database-users", makeUserAttrs());
          }
          return mockListDocument("database-users", [
            { id: 1, attributes: makeUserAttrs() as never },
          ]);
        },
        post: async () =>
          mockDocument(2, "database-users", makeUserAttrs({ name: "newuser", status: "creating" })),
        delete: async () => {},
      } as never,
    },
    compact: true,
  };
}

describe("handleDatabaseUsers", () => {
  it("should list database users", async () => {
    const result = await handleDatabaseUsers(
      "list",
      { resource: "database-users", action: "list", server_id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("forge");
  });

  it("should get a database user", async () => {
    const result = await handleDatabaseUsers(
      "get",
      { resource: "database-users", action: "get", server_id: "1", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("forge");
  });

  it("should create a database user", async () => {
    const result = await handleDatabaseUsers(
      "create",
      {
        resource: "database-users",
        action: "create",
        server_id: "1",
        name: "newuser",
        password: "secret",
      },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("newuser");
  });

  it("should delete a database user", async () => {
    const result = await handleDatabaseUsers(
      "delete",
      { resource: "database-users", action: "delete", server_id: "1", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("deleted");
  });

  it("should require server_id for list", async () => {
    const result = await handleDatabaseUsers(
      "list",
      { resource: "database-users", action: "list" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
  });

  it("should require name and password for create", async () => {
    const result = await handleDatabaseUsers(
      "create",
      { resource: "database-users", action: "create", server_id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
  });

  it("should handle unknown action", async () => {
    const result = await handleDatabaseUsers(
      "unknown",
      { resource: "database-users", action: "unknown", server_id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
  });

  it("should inject hints on get when includeHints=true", async () => {
    const ctx = createMockContext();
    ctx.compact = false;
    ctx.includeHints = true;

    const result = await handleDatabaseUsers(
      "get",
      { resource: "database-users", action: "get", server_id: "1", id: "1" },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed._hints).toBeDefined();
    expect(parsed._hints.related_resources).toBeDefined();
  });
});
