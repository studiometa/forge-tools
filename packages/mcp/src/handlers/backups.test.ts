import { describe, expect, it } from "vitest";

import type { HandlerContext } from "./types.ts";

import { handleBackups } from "./backups.ts";

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      client: {
        get: async () => ({
          backups: [
            {
              id: 1,
              provider_name: "S3",
              frequency: "daily",
              status: "installed",
              last_backup_time: null,
            },
          ],
          backup: {
            id: 1,
            provider_name: "S3",
            frequency: "daily",
            status: "installed",
            retention: 7,
            databases: [],
            last_backup_time: null,
          },
        }),
        post: async () => ({
          backup: { id: 1, provider_name: "S3" },
        }),
        delete: async () => undefined,
      } as never,
    },
    compact: true,
  };
}

describe("handleBackups", () => {
  it("should list backup configs", async () => {
    const result = await handleBackups(
      "list",
      { resource: "backups", action: "list", server_id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("S3");
  });

  it("should get a backup config", async () => {
    const result = await handleBackups(
      "get",
      { resource: "backups", action: "get", server_id: "1", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("S3");
  });

  it("should require server_id", async () => {
    const result = await handleBackups(
      "list",
      { resource: "backups", action: "list" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("server_id");
  });

  it("should handle unknown action", async () => {
    const result = await handleBackups(
      "unknown",
      { resource: "backups", action: "unknown", server_id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("Unknown action");
  });
});
