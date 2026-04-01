import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { getBackupConfig } from "./get.ts";

describe("getBackupConfig", () => {
  it("should get a backup config and format output", async () => {
    const getMock = async () =>
      mockDocument(1, "backup-configs", {
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
      });

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await getBackupConfig({ server_id: "1", id: "1" }, ctx);

    expect(result.data.name).toBe("S3 Backup");
  });

  it("should show never and empty backup info", async () => {
    const getMock = async () =>
      mockDocument(2, "backup-configs", {
        name: "Spaces Backup",
        storage_provider_id: null,
        provider: "spaces",
        bucket: null,
        directory: "/backups",
        schedule: "weekly",
        displayable_schedule: "Weekly at 03:00",
        next_run_time: "2024-01-07T03:00:00.000000Z",
        day_of_week: 0,
        time: "03:00",
        cron_schedule: null,
        retention: 3,
        status: "installed",
        notify_email: null,
      });

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    await getBackupConfig({ server_id: "1", id: "2" }, ctx);
  });
});
