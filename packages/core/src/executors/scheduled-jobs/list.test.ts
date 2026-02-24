import { describe, expect, it } from "vitest";

import type { ScheduledJobsResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { listScheduledJobs } from "./list.ts";

describe("listScheduledJobs", () => {
  it("should list scheduled jobs and format output", async () => {
    const jobs = [
      {
        id: 1,
        command: "php artisan schedule:run",
        frequency: "minutely",
        status: "installed",
        user: "forge",
      },
    ];

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ jobs }) as ScheduledJobsResponse,
      } as never,
    });

    const result = await listScheduledJobs({ server_id: "1" }, ctx);

    expect(result.data).toHaveLength(1);
  });

  it("should handle empty list", async () => {
    const ctx = createTestExecutorContext({
      client: { get: async () => ({ jobs: [] }) } as never,
    });

    const result = await listScheduledJobs({ server_id: "1" }, ctx);

    expect(result.data).toHaveLength(0);
  });
});
