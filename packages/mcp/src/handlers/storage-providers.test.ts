import { describe, expect, it, vi } from "vitest";

import { mockDocument, mockListDocument } from "@studiometa/forge-core";

import type { HandlerContext } from "./types.ts";

import { handleStorageProviders } from "./storage-providers.ts";

function makeAttrs(overrides: Record<string, unknown> = {}) {
  return {
    name: "Backups",
    provider: "custom",
    provider_name: "Custom (S3 Compatible)",
    region: "eu-west-1",
    bucket: "my-bucket",
    directory: null,
    endpoint: "https://s3.example.com",
    assume_role: false,
    in_use: false,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    ...overrides,
  };
}

function createMockContext(
  post = vi.fn(async () => mockDocument(2, "storageProviders", makeAttrs())),
) {
  const ctx: HandlerContext = {
    executorContext: {
      organizationSlug: "test-org",
      client: {
        get: async (url: string) => {
          if (/\/storage-providers\/\d+$/.test(url)) {
            return mockDocument(1, "storageProviders", makeAttrs({ in_use: true }));
          }
          return mockListDocument("storageProviders", [
            { id: 1, attributes: makeAttrs() as never },
          ]);
        },
        post,
        delete: async () => {},
      } as never,
    },
    compact: true,
  };
  return { ctx, post };
}

describe("handleStorageProviders", () => {
  it("should list storage providers", async () => {
    const { ctx } = createMockContext();
    const result = await handleStorageProviders(
      "list",
      { resource: "storage-providers", action: "list" },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Backups (ID: 1)");
  });

  it("should get a storage provider", async () => {
    const { ctx } = createMockContext();
    const result = await handleStorageProviders(
      "get",
      { resource: "storage-providers", action: "get", id: "1" },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("In use: yes");
  });

  it("should create a storage provider", async () => {
    const { ctx, post } = createMockContext();
    const result = await handleStorageProviders(
      "create",
      {
        resource: "storage-providers",
        action: "create",
        name: "Backups",
        provider: "custom",
        endpoint: "https://s3.example.com",
        region: "eu-west-1",
        access_key: "access",
        secret_key: "secret",
      },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Storage Provider: Backups (ID: 2)");
    expect(result.content[0].text).not.toContain("secret");
    expect(post).toHaveBeenCalledWith(
      "/orgs/test-org/storage-providers",
      expect.objectContaining({ provider: "custom", secret_key: "secret" }),
    );
  });

  it("should reject an unknown provider type", async () => {
    const { ctx } = createMockContext();
    const result = await handleStorageProviders(
      "create",
      { resource: "storage-providers", action: "create", name: "Backups", provider: "dropbox" },
      ctx,
    );
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("provider");
  });

  it("should delete a storage provider", async () => {
    const { ctx } = createMockContext();
    const result = await handleStorageProviders(
      "delete",
      { resource: "storage-providers", action: "delete", id: "1" },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Storage provider 1 deleted.");
  });
});
