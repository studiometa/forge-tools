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
            command: "php artisan inspire",
            user: "forge",
            frequency: "daily",
            cron: "0 0 * * *",
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
});
