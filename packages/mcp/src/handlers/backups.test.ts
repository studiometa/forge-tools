import { describe, expect, it } from "vitest";

import { mockDocument, mockListDocument } from "@studiometa/forge-core";

import type { HandlerContext } from "./types.ts";

import { handleBackups } from "./backups.ts";

function makeBackupAttrs(overrides: Record<string, unknown> = {}) {
  return {
    provider_name: "S3",
    provider: "s3",
    frequency: "daily",
    status: "active",
    retention: 7,
    last_backup_time: null,
    day_of_week: null,
    time: null,
    directory: null,
    email: null,
    ...overrides,
  };
}

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      organizationSlug: "test-org",
      client: {
        get: async (url: string) => {
          if (url.match(/\/database\/backups\/\d+$/)) {
            return mockDocument(1, "backup-configs", makeBackupAttrs());
          }
          return mockListDocument("backup-configs", [
            { id: 1, attributes: makeBackupAttrs({ status: "installed" }) as never },
          ]);
        },
        post: async () => mockDocument(1, "backup-configs", makeBackupAttrs()),
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

  it("should create a backup config", async () => {
    const result = await handleBackups(
      "create",
      {
        resource: "backups",
        action: "create",
        server_id: "1",
        provider: "s3",
        credentials: {},
        frequency: "daily",
        databases: [1],
      },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("S3");
  });

  it("should delete a backup config", async () => {
    const result = await handleBackups(
      "delete",
      { resource: "backups", action: "delete", server_id: "1", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("deleted");
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
