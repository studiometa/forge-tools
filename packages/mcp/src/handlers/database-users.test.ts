import { describe, expect, it } from "vitest";

import type { HandlerContext } from "./types.ts";

import { handleDatabaseUsers } from "./database-users.ts";

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      client: {
        get: async () => ({
          users: [
            {
              id: 1,
              name: "forge",
              status: "installed",
              server_id: 1,
              databases: [],
              created_at: "2024-01-01",
            },
          ],
          user: {
            id: 1,
            name: "forge",
            status: "installed",
            server_id: 1,
            databases: [1],
            created_at: "2024-01-01",
          },
        }),
        post: async () => ({
          user: {
            id: 2,
            name: "newuser",
            status: "creating",
            server_id: 1,
            databases: [],
            created_at: "2024-01-01",
          },
        }),
        delete: async () => undefined,
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
    expect(result.content[0]!.text).toContain("forge");
  });

  it("should get a database user", async () => {
    const result = await handleDatabaseUsers(
      "get",
      { resource: "database-users", action: "get", server_id: "1", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("forge");
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
    expect(result.content[0]!.text).toContain("newuser");
  });

  it("should delete a database user", async () => {
    const result = await handleDatabaseUsers(
      "delete",
      { resource: "database-users", action: "delete", server_id: "1", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("deleted");
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
    const parsed = JSON.parse(result.content[0]!.text);
    expect(parsed._hints).toBeDefined();
    expect(parsed._hints.related_resources).toBeDefined();
  });
});
