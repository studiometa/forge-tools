import { describe, expect, it } from "vitest";

import { mockDocument, mockListDocument } from "@studiometa/forge-core";

import type { HandlerContext } from "./types.ts";

import { handleScheduledJobs } from "./scheduled-jobs.ts";

function makeJobAttrs(overrides: Record<string, unknown> = {}) {
  return {
    name: null,
    command: "php artisan schedule:run",
    user: "forge",
    frequency: "minutely",
    cron: "* * * * *",
    next_run_time: "2024-01-01 00:01:00",
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
          if (url.match(/\/scheduled-jobs\/\d+$/)) {
            return mockDocument(1, "scheduled-jobs", makeJobAttrs());
          }
          return mockListDocument("scheduled-jobs", [
            { id: 1, attributes: makeJobAttrs() as never },
          ]);
        },
        post: async () =>
          mockDocument(
            2,
            "scheduled-jobs",
            makeJobAttrs({ command: "php artisan inspire", frequency: "daily" }),
          ),
        delete: async () => undefined,
      } as never,
    },
    compact: true,
  };
}

describe("handleScheduledJobs", () => {
  it("should list scheduled jobs", async () => {
    const result = await handleScheduledJobs(
      "list",
      { resource: "scheduled-jobs", action: "list", server_id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("schedule:run");
  });

  it("should get a scheduled job", async () => {
    const result = await handleScheduledJobs(
      "get",
      { resource: "scheduled-jobs", action: "get", server_id: "1", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("schedule:run");
  });

  it("should create a scheduled job", async () => {
    const result = await handleScheduledJobs(
      "create",
      {
        resource: "scheduled-jobs",
        action: "create",
        server_id: "1",
        command: "php artisan inspire",
        frequency: "daily",
      },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("inspire");
  });

  it("should delete a scheduled job", async () => {
    const result = await handleScheduledJobs(
      "delete",
      { resource: "scheduled-jobs", action: "delete", server_id: "1", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
  });

  it("should require server_id", async () => {
    const result = await handleScheduledJobs(
      "list",
      { resource: "scheduled-jobs", action: "list" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("server_id");
  });

  it("should handle unknown action", async () => {
    const result = await handleScheduledJobs(
      "unknown",
      { resource: "scheduled-jobs", action: "unknown", server_id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("Unknown action");
  });
});
