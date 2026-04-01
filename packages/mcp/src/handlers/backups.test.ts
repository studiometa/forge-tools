import { describe, expect, it } from "vitest";

import { mockDocument, mockListDocument } from "@studiometa/forge-core";

import type { HandlerContext } from "./types.ts";

import { handleBackups } from "./backups.ts";

function makeBackupAttrs(overrides: Record<string, unknown> = {}) {
  return {
    name: "S3 Backup",
    storage_provider_id: null,
    provider: "s3",
    bucket: null,
    directory: "/backups",
    schedule: "daily",
    displayable_schedule: "Daily at 00:00",
    next_run_time: "2024-01-16",
    status: "active",
    day_of_week: null,
    time: null,
    cron_schedule: null,
    retention: 7,
    notify_email: null,
    ...overrides,
  };
}

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      organizationSlug: "test-org",
      client: {
        get: async (url: string) => {
          if (/\/database\/backups\/\d+$/.test(url)) {
            return mockDocument(1, "backup-configs", makeBackupAttrs());
          }
          return mockListDocument("backup-configs", [
            { id: 1, attributes: makeBackupAttrs({ status: "installed" }) as never },
          ]);
        },
        post: async () => {},
        put: async () => {},
        delete: async () => {},
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
    expect(result.content[0].text).toContain("S3 Backup");
  });

  it("should get a backup config", async () => {
    const result = await handleBackups(
      "get",
      { resource: "backups", action: "get", server_id: "1", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("S3 Backup");
  });

  it("should require server_id", async () => {
    const result = await handleBackups(
      "list",
      { resource: "backups", action: "list" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("server_id");
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
    expect(result.content[0].text).toContain("Done");
  });

  it("should update a backup config", async () => {
    const result = await handleBackups(
      "update",
      {
        resource: "backups",
        action: "update",
        server_id: "1",
        id: "5",
        storage_provider_id: 1,
        frequency: "weekly",
        retention: 7,
        database_ids: [1],
      },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Done");
  });

  it("should delete a backup config", async () => {
    const result = await handleBackups(
      "delete",
      { resource: "backups", action: "delete", server_id: "1", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("deleted");
  });

  it("should handle unknown action", async () => {
    const result = await handleBackups(
      "unknown",
      { resource: "backups", action: "unknown", server_id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Unknown action");
  });
});
