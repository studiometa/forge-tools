import { describe, expect, it, vi } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { getStorageProvider } from "./get.ts";

describe("getStorageProvider", () => {
  it("should get a storage provider", async () => {
    const get = vi.fn(async () =>
      mockDocument(5, "storageProviders", {
        name: "Backups",
        provider: "s3",
        provider_name: "Amazon S3",
        region: "us-east-1",
        bucket: "my-bucket",
        directory: "backups",
        endpoint: null,
        assume_role: false,
        in_use: true,
        created_at: "2024-01-01T00:00:00.000000Z",
        updated_at: "2024-01-01T00:00:00.000000Z",
      }),
    );
    const ctx = createTestExecutorContext({
      client: { get } as never,
      organizationSlug: "test-org",
    });

    const result = await getStorageProvider({ id: "5" }, ctx);

    expect(get).toHaveBeenCalledWith("/orgs/test-org/storage-providers/5");
    expect(result.data).toMatchObject({ id: 5, name: "Backups", in_use: true });
  });
});
