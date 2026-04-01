import { describe, expect, it } from "vitest";

import { mockListDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { listScheduledJobs } from "./list.ts";

describe("listScheduledJobs", () => {
  it("should list scheduled jobs and format output", async () => {
    const getMock = async () =>
      mockListDocument("scheduled-jobs", [
        {
          id: 1,
          attributes: {
            name: null,
            command: "php artisan schedule:run",
            user: "forge",
            frequency: "minutely",
            cron: "* * * * *",
            next_run_time: "2024-01-02T00:00:00.000000Z",
            status: "installed",
            created_at: "2024-01-01T00:00:00.000000Z",
            updated_at: "2024-01-01T00:00:00.000000Z",
          },
        },
      ]);

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await listScheduledJobs({ server_id: "1" }, ctx);

    expect(result.data).toHaveLength(1);
  });

  it("should handle empty list", async () => {
    const ctx = createTestExecutorContext({
      client: { get: async () => mockListDocument("scheduled-jobs", []) } as never,
      organizationSlug: "test-org",
    });

    const result = await listScheduledJobs({ server_id: "1" }, ctx);

    expect(result.data).toHaveLength(0);
  });
});
