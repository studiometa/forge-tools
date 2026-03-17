import { describe, expect, it } from "vitest";

import { mockDocument, mockListDocument } from "@studiometa/forge-core";

import type { HandlerContext } from "./types.ts";

import { handleCommands } from "./commands.ts";

function makeCommandAttrs(overrides: Record<string, unknown> = {}) {
  return {
    command: "php artisan migrate",
    status: "finished",
    user_name: "forge",
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
          if (url.match(/\/commands\/\d+$/)) {
            return mockDocument(1, "commands", makeCommandAttrs());
          }
          return mockListDocument("commands", [{ id: 1, attributes: makeCommandAttrs() as never }]);
        },
        post: async () =>
          mockDocument(
            2,
            "commands",
            makeCommandAttrs({ command: "php artisan cache:clear", status: "running" }),
          ),
      } as never,
    },
    compact: true,
  };
}

describe("handleCommands", () => {
  it("should list commands", async () => {
    const result = await handleCommands(
      "list",
      { resource: "commands", action: "list", server_id: "1", site_id: "2" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("migrate");
  });

  it("should create a command", async () => {
    const result = await handleCommands(
      "create",
      {
        resource: "commands",
        action: "create",
        server_id: "1",
        site_id: "2",
        command: "php artisan cache:clear",
      },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("cache:clear");
  });

  it("should get a command", async () => {
    const result = await handleCommands(
      "get",
      { resource: "commands", action: "get", server_id: "1", site_id: "2", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("migrate");
  });

  it("should require server_id and site_id", async () => {
    const result = await handleCommands(
      "list",
      { resource: "commands", action: "list" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("server_id");
  });

  it("should handle unknown action", async () => {
    const result = await handleCommands(
      "unknown",
      { resource: "commands", action: "unknown", server_id: "1", site_id: "2" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("Unknown action");
  });
});
