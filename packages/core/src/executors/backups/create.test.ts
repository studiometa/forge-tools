import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { createBackupConfig } from "./create.ts";

describe("createBackupConfig", () => {
  it("should create a backup config and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          mockDocument(3, "backup-configs", {
            day_of_week: null,
            time: null,
            provider: "s3",
            provider_name: "S3",
            frequency: "daily",
            directory: null,
            email: null,
            retention: 7,
            status: "creating",
            last_backup_time: null,
          }),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await createBackupConfig(
      {
        server_id: "1",
        provider: "s3",
        credentials: { key: "xxx", secret: "yyy", region: "us-east-1", bucket: "my-backups" },
        frequency: "daily",
        databases: [1],
      },
      ctx,
    );

    expect(result.data.provider_name).toBe("S3");
  });
});
