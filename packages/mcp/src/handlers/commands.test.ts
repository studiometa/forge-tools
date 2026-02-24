import { describe, expect, it } from "vitest";

import type { HandlerContext } from "./types.ts";

import { handleCommands } from "./commands.ts";

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      client: {
        get: async () => ({
          commands: [
            { id: 1, command: "php artisan migrate", status: "finished", user_name: "forge" },
          ],
          command: {
            id: 1,
            command: "php artisan migrate",
            status: "finished",
            user_name: "forge",
            created_at: "2024-01-01",
          },
        }),
        post: async () => ({
          command: { id: 2, command: "php artisan cache:clear", status: "running" },
        }),
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
