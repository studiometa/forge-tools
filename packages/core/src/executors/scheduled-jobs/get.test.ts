import { describe, expect, it } from "vitest";

import type { ScheduledJobResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { getScheduledJob } from "./get.ts";

describe("getScheduledJob", () => {
  it("should get a scheduled job and format output", async () => {
    const job = {
      id: 1,
      command: "php artisan schedule:run",
      user: "forge",
      frequency: "minutely",
      cron: "* * * * *",
      status: "installed",
      created_at: "2024-01-01T00:00:00Z",
    };

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ job }) as ScheduledJobResponse,
      } as never,
    });

    const result = await getScheduledJob({ server_id: "1", id: "1" }, ctx);

    expect(result.data.command).toBe("php artisan schedule:run");
    expect(result.text).toContain("schedule:run");
    expect(result.text).toContain("minutely");
    expect(result.text).toContain("* * * * *");
    expect(result.text).toContain("forge");
  });
});
