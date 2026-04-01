import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { createScheduledJob } from "./create.ts";

describe("createScheduledJob", () => {
  it("should create a scheduled job and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          mockDocument(5, "scheduled-jobs", {
            name: null,
            command: "php artisan inspire",
            user: "forge",
            frequency: "daily",
            cron: "0 0 * * *",
            next_run_time: "2024-01-02T00:00:00.000000Z",
            status: "creating",
            created_at: "2024-01-01T00:00:00.000000Z",
            updated_at: "2024-01-01T00:00:00.000000Z",
          }),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await createScheduledJob(
      { server_id: "1", command: "php artisan inspire", frequency: "daily" },
      ctx,
    );

    expect(result.data.command).toBe("php artisan inspire");
  });

  it("should create a site-scoped scheduled job", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async (url: string) => {
          expect(url).toContain("/sites/42/scheduled-jobs");
          return mockDocument(5, "scheduled-jobs", {
            name: null,
            command: "php artisan inspire",
            user: "forge",
            frequency: "daily",
            cron: "0 0 * * *",
            next_run_time: "2024-01-02T00:00:00.000000Z",
            status: "creating",
            created_at: "2024-01-01T00:00:00.000000Z",
            updated_at: "2024-01-01T00:00:00.000000Z",
          });
        },
      } as never,
      organizationSlug: "test-org",
    });

    const result = await createScheduledJob(
      { server_id: "1", site_id: "42", command: "php artisan inspire", frequency: "daily" },
      ctx,
    );

    expect(result.data.command).toBe("php artisan inspire");
  });
});
