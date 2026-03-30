import { describe, expect, it } from "vitest";

import { mockListDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { listBackupConfigs } from "./list.ts";

describe("listBackupConfigs", () => {
  it("should list backup configs and format output", async () => {
    const getMock = async () =>
      mockListDocument("backup-configs", [
        {
          id: 1,
          attributes: {
            name: "S3 Backup",
            storage_provider_id: null,
            provider: "s3",
            bucket: null,
            directory: "/backups",
            schedule: "daily",
            displayable_schedule: "Daily at 02:00",
            next_run_time: "2024-01-02",
            day_of_week: null,
            time: "02:00",
            cron_schedule: null,
            retention: 7,
            status: "installed",
            notify_email: null,
          },
        },
        {
          id: 2,
          attributes: {
            name: "Spaces Backup",
            storage_provider_id: null,
            provider: "spaces",
            bucket: null,
            directory: "/backups",
            schedule: "weekly",
            displayable_schedule: "Weekly at 03:00",
            next_run_time: "2024-01-07",
            day_of_week: 0,
            time: "03:00",
            cron_schedule: null,
            retention: 3,
            status: "installed",
            notify_email: null,
          },
        },
      ]);

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await listBackupConfigs({ server_id: "1" }, ctx);

    expect(result.data).toHaveLength(2);
  });

  it("should handle empty list", async () => {
    const ctx = createTestExecutorContext({
      client: { get: async () => mockListDocument("backup-configs", []) } as never,
      organizationSlug: "test-org",
    });

    const result = await listBackupConfigs({ server_id: "1" }, ctx);

    expect(result.data).toHaveLength(0);
  });
});
