import { describe, expect, it } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { createBackupConfig } from "./create.ts";

describe("createBackupConfig", () => {
  it("should create a backup config and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () => {},
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

    expect(result.data).toBeUndefined();
  });
});
