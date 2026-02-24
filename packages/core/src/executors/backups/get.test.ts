import { describe, expect, it } from "vitest";

import type { BackupConfigResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { getBackupConfig } from "./get.ts";

describe("getBackupConfig", () => {
  it("should get a backup config and format output", async () => {
    const backup = {
      id: 1,
      provider_name: "S3",
      frequency: "daily",
      status: "installed",
      retention: 7,
      databases: [{ id: 1, name: "myapp" }],
      last_backup_time: "2024-01-01T00:00:00Z",
    };

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ backup }) as BackupConfigResponse,
      } as never,
    });

    const result = await getBackupConfig({ server_id: "1", id: "1" }, ctx);

    expect(result.data.provider_name).toBe("S3");
    expect(result.text).toContain("S3");
    expect(result.text).toContain("daily");
    expect(result.text).toContain("7 backups");
    expect(result.text).toContain("myapp");
  });

  it("should show never and no databases", async () => {
    const backup = {
      id: 2,
      provider_name: "Spaces",
      frequency: "weekly",
      status: "installed",
      retention: 3,
      databases: [],
      last_backup_time: null,
    };

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ backup }) as BackupConfigResponse,
      } as never,
    });

    const result = await getBackupConfig({ server_id: "1", id: "2" }, ctx);

    expect(result.text).toContain("never");
    expect(result.text).toContain("none");
  });
});
