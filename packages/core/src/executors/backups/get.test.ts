import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { getBackupConfig } from "./get.ts";

describe("getBackupConfig", () => {
  it("should get a backup config and format output", async () => {
    const getMock = async () =>
      mockDocument(1, "backup-configs", {
        day_of_week: null,
        time: "02:00",
        provider: "s3",
        provider_name: "S3",
        frequency: "daily",
        directory: null,
        email: null,
        retention: 7,
        status: "installed",
        last_backup_time: "2024-01-01T00:00:00Z",
      });

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await getBackupConfig({ server_id: "1", id: "1" }, ctx);

    expect(result.data.provider_name).toBe("S3");
  });

  it("should show never and empty backup info", async () => {
    const getMock = async () =>
      mockDocument(2, "backup-configs", {
        day_of_week: 0,
        time: "03:00",
        provider: "spaces",
        provider_name: "Spaces",
        frequency: "weekly",
        directory: null,
        email: null,
        retention: 3,
        status: "installed",
        last_backup_time: null,
      });

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    await getBackupConfig({ server_id: "1", id: "2" }, ctx);
  });
});
