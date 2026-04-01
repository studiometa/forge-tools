import { describe, expect, it } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { updateBackupConfig } from "./update.ts";

describe("updateBackupConfig", () => {
  it("should update a backup config", async () => {
    const ctx = createTestExecutorContext({
      client: {
        put: async () => {},
      } as never,
      organizationSlug: "test-org",
    });

    const result = await updateBackupConfig(
      {
        server_id: "1",
        id: "5",
        storage_provider_id: 1,
        frequency: "weekly",
        retention: 7,
        database_ids: [1, 2],
        name: "My Backup",
        day: "monday",
        time: "02:00",
      },
      ctx,
    );

    expect(result.data).toBeUndefined();
  });
});
