import { describe, expect, it } from "vitest";

import type { HandlerContext } from "./types.ts";

import { handleDaemons } from "./daemons.ts";

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      client: {
        get: async () => ({
          daemons: [
            {
              id: 1,
              command: "php artisan queue:work",
              user: "forge",
              processes: 1,
              status: "running",
            },
          ],
          daemon: {
            id: 1,
            server_id: 1,
            command: "php artisan queue:work",
            user: "forge",
            processes: 1,
            status: "running",
            created_at: "2024-01-01",
          },
        }),
        post: async () => ({
          daemon: {
            id: 2,
            command: "node server.js",
            user: "forge",
            processes: 1,
            status: "starting",
          },
        }),
        delete: async () => undefined,
      } as never,
    },
    compact: true,
  };
}

describe("handleDaemons", () => {
  it("should list daemons", async () => {
    const result = await handleDaemons(
      "list",
      { resource: "daemons", action: "list", server_id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("queue:work");
  });

  it("should get a daemon", async () => {
    const result = await handleDaemons(
      "get",
      { resource: "daemons", action: "get", server_id: "1", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("queue:work");
  });

  it("should create a daemon", async () => {
    const result = await handleDaemons(
      "create",
      { resource: "daemons", action: "create", server_id: "1", command: "node server.js" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("node server.js");
  });

  it("should delete a daemon", async () => {
    const result = await handleDaemons(
      "delete",
      { resource: "daemons", action: "delete", server_id: "1", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("deleted");
  });

  it("should restart a daemon", async () => {
    const result = await handleDaemons(
      "restart",
      { resource: "daemons", action: "restart", server_id: "1", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("restarted");
  });

  it("should require server_id for list", async () => {
    const result = await handleDaemons(
      "list",
      { resource: "daemons", action: "list" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
  });

  it("should handle unknown action", async () => {
    const result = await handleDaemons(
      "unknown",
      { resource: "daemons", action: "unknown", server_id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("Unknown action");
  });

  it("should inject hints on get when includeHints=true", async () => {
    const ctx = createMockContext();
    ctx.compact = false;
    ctx.includeHints = true;

    const result = await handleDaemons(
      "get",
      { resource: "daemons", action: "get", server_id: "1", id: "1" },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0]!.text);
    expect(parsed._hints).toBeDefined();
    expect(parsed._hints.related_resources).toBeDefined();
  });
});
