import { describe, expect, it, vi } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { createStorageProvider } from "./create.ts";

describe("createStorageProvider", () => {
  it("should post the provider data and return the created provider", async () => {
    const post = vi.fn(async () =>
      mockDocument(9, "storageProviders", {
        name: "Backups",
        provider: "custom",
        provider_name: "Custom (S3 Compatible)",
        region: "eu-west-1",
        bucket: "my-bucket",
        directory: null,
        endpoint: "https://s3.example.com",
        assume_role: false,
        in_use: false,
        created_at: "2024-01-01T00:00:00.000000Z",
        updated_at: "2024-01-01T00:00:00.000000Z",
      }),
    );
    const ctx = createTestExecutorContext({
      client: { post } as never,
      organizationSlug: "test-org",
    });

    const data = {
      name: "Backups",
      provider: "custom" as const,
      region: "eu-west-1",
      endpoint: "https://s3.example.com",
      bucket: "my-bucket",
      access_key: "access",
      secret_key: "secret",
    };
    const result = await createStorageProvider(data, ctx);

    expect(post).toHaveBeenCalledWith("/orgs/test-org/storage-providers", data);
    expect(result.data).toMatchObject({ id: 9, name: "Backups" });
  });
});
