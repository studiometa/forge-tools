import { describe, expect, it } from "vitest";

import type { ScheduledJobResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { createScheduledJob } from "./create.ts";

describe("createScheduledJob", () => {
  it("should create a scheduled job and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          ({
            job: { id: 5, command: "php artisan inspire", frequency: "daily" },
          }) as ScheduledJobResponse,
      } as never,
    });

    const result = await createScheduledJob(
      { server_id: "1", command: "php artisan inspire", frequency: "daily" },
      ctx,
    );

    expect(result.data.command).toBe("php artisan inspire");
    expect(result.text).toContain("php artisan inspire");
    expect(result.text).toContain("daily");
  });
});
