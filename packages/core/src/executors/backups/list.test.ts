import { describe, expect, it } from "vitest";

import type { BackupConfigsResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { listBackupConfigs } from "./list.ts";

describe("listBackupConfigs", () => {
  it("should list backup configs and format output", async () => {
    const backups = [
      {
        id: 1,
        provider_name: "S3",
        frequency: "daily",
        status: "installed",
        last_backup_time: "2024-01-01",
      },
      {
        id: 2,
        provider_name: "Spaces",
        frequency: "weekly",
        status: "installed",
        last_backup_time: null,
      },
    ];

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ backups }) as BackupConfigsResponse,
      } as never,
    });

    const result = await listBackupConfigs({ server_id: "1" }, ctx);

    expect(result.data).toHaveLength(2);
    expect(result.text).toContain("2 backup config(s)");
    expect(result.text).toContain("S3");
    expect(result.text).toContain("never");
  });

  it("should handle empty list", async () => {
    const ctx = createTestExecutorContext({
      client: { get: async () => ({ backups: [] }) } as never,
    });

    const result = await listBackupConfigs({ server_id: "1" }, ctx);

    expect(result.data).toHaveLength(0);
    expect(result.text).toContain("No backup configurations");
  });
});
