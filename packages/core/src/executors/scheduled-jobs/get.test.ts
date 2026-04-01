import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { getScheduledJob } from "./get.ts";

describe("getScheduledJob", () => {
  it("should get a scheduled job and format output", async () => {
    const getMock = async () =>
      mockDocument(1, "scheduled-jobs", {
        name: null,
        command: "php artisan schedule:run",
        user: "forge",
        frequency: "minutely",
        cron: "* * * * *",
        next_run_time: "2024-01-02T00:00:00.000000Z",
        status: "installed",
        created_at: "2024-01-01T00:00:00.000000Z",
        updated_at: "2024-01-01T00:00:00.000000Z",
      });

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await getScheduledJob({ server_id: "1", id: "1" }, ctx);

    expect(result.data.command).toBe("php artisan schedule:run");
  });
});
