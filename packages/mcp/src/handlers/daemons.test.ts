import { describe, expect, it } from "vitest";

import { mockDocument, mockListDocument } from "@studiometa/forge-core";

import type { HandlerContext } from "./types.ts";

import { handleDaemons } from "./daemons.ts";

function makeDaemonAttrs(overrides: Record<string, unknown> = {}) {
  return {
    command: "php artisan queue:work",
    user: "forge",
    directory: null,
    processes: 1,
    startsecs: 0,
    stopsignal: "TERM",
    stopwaitsecs: 10,
    status: "running",
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
          if (url.match(/\/background-processes\/\d+$/)) {
            return mockDocument(1, "background-processes", makeDaemonAttrs());
          }
          return mockListDocument("background-processes", [
            { id: 1, attributes: makeDaemonAttrs() as never },
          ]);
        },
        post: async () =>
          mockDocument(
            2,
            "background-processes",
            makeDaemonAttrs({ command: "node server.js", status: "starting" }),
          ),
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
