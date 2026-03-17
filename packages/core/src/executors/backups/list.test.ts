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
            day_of_week: null,
            time: "02:00",
            provider: "s3",
            provider_name: "S3",
            frequency: "daily",
            directory: null,
            email: null,
            retention: 7,
            status: "installed",
            last_backup_time: "2024-01-01",
          },
        },
        {
          id: 2,
          attributes: {
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
