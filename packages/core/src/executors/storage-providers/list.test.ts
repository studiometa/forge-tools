import { describe, expect, it, vi } from "vitest";

import { mockListDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { listStorageProviders } from "./list.ts";

const attributes = {
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
};

describe("listStorageProviders", () => {
  it("should list storage providers", async () => {
    const get = vi.fn(async () => mockListDocument("storageProviders", [{ id: 1, attributes }]));
    const ctx = createTestExecutorContext({
      client: { get } as never,
      organizationSlug: "test-org",
    });

    const result = await listStorageProviders({}, ctx);

    expect(get).toHaveBeenCalledWith("/orgs/test-org/storage-providers");
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({ id: 1, name: "Backups", provider: "custom" });
  });

  it("should handle empty list", async () => {
    const ctx = createTestExecutorContext({
      client: { get: async () => mockListDocument("storageProviders", []) } as never,
      organizationSlug: "test-org",
    });

    const result = await listStorageProviders({}, ctx);

    expect(result.data).toHaveLength(0);
  });

  it("should filter by provider type", async () => {
    const get = vi.fn(async () => mockListDocument("storageProviders", []));
    const ctx = createTestExecutorContext({
      client: { get } as never,
      organizationSlug: "test-org",
    });

    await listStorageProviders({ provider: "s3" }, ctx);

    expect(get).toHaveBeenCalledWith("/orgs/test-org/storage-providers?filter%5Bprovider%5D=s3");
  });
});
