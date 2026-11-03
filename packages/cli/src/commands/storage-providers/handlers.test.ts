import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { StorageProviderAttributes } from "@studiometa/forge-api";

import { createTestContext } from "../../context.ts";
import {
  storageProvidersCreate,
  storageProvidersDelete,
  storageProvidersGet,
  storageProvidersList,
} from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  listStorageProviders: vi.fn(),
  getStorageProvider: vi.fn(),
  createStorageProvider: vi.fn(),
  deleteStorageProvider: vi.fn(),
}));

vi.mock("node:fs", () => ({
  readFileSync: vi.fn(),
}));

const mockProvider: StorageProviderAttributes & { id: number } = {
  id: 3,
  name: "Backups",
  provider: "custom",
  provider_name: "Custom (S3 Compatible)",
  region: "eu-west-1",
  bucket: "my-bucket",
  directory: null,
  endpoint: "https://s3.example.com",
  assume_role: false,
  in_use: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

let processExitSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("storageProvidersList", () => {
  it("should list storage providers", async () => {
    const { listStorageProviders } = await import("@studiometa/forge-core");
    vi.mocked(listStorageProviders).mockResolvedValue({ data: [mockProvider] });

    const ctx = createTestContext({ mockClient: {} as never, options: { format: "json" } });

    await storageProvidersList(ctx);
    expect(vi.mocked(listStorageProviders)).toHaveBeenCalledWith({}, expect.anything());
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"Backups"'));
  });

  it("should filter by provider type", async () => {
    const { listStorageProviders } = await import("@studiometa/forge-core");
    vi.mocked(listStorageProviders).mockResolvedValue({ data: [] });

    const ctx = createTestContext({
      mockClient: {} as never,
      options: { format: "json", provider: "custom" },
    });

    await storageProvidersList(ctx);
    expect(vi.mocked(listStorageProviders)).toHaveBeenCalledWith(
      { provider: "custom" },
      expect.anything(),
    );
  });

  it("should render human lines", async () => {
    const { listStorageProviders } = await import("@studiometa/forge-core");
    vi.mocked(listStorageProviders).mockResolvedValue({
      data: [mockProvider, { ...mockProvider, id: 4, bucket: null, in_use: false }],
    });

    const ctx = createTestContext({ mockClient: {} as never, options: { format: "human" } });

    await storageProvidersList(ctx);
    const lines = vi.mocked(console.log).mock.calls.map((c) => String(c[0]));
    expect(lines[0]).toContain("my-bucket (in use)");
    expect(lines[1]).toContain("—");
    expect(lines[1]).not.toContain("in use");
  });

  it("should handle errors", async () => {
    const { listStorageProviders } = await import("@studiometa/forge-core");
    vi.mocked(listStorageProviders).mockRejectedValue(new Error("API error"));

    const ctx = createTestContext({ mockClient: {} as never, options: { format: "json" } });

    await storageProvidersList(ctx);
    expect(processExitSpy).toHaveBeenCalled();
  });
});

describe("storageProvidersGet", () => {
  it("should get a storage provider", async () => {
    const { getStorageProvider } = await import("@studiometa/forge-core");
    vi.mocked(getStorageProvider).mockResolvedValue({ data: mockProvider });

    const ctx = createTestContext({ mockClient: {} as never, options: { format: "json" } });

    await storageProvidersGet(["3"], ctx);
    expect(vi.mocked(getStorageProvider)).toHaveBeenCalledWith({ id: "3" }, expect.anything());
  });

  it("should exit with error when no id", async () => {
    const ctx = createTestContext({ mockClient: {} as never, options: { format: "json" } });

    await storageProvidersGet([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("storageProvidersCreate", () => {
  it("should create a custom provider with the secret key from stdin", async () => {
    const { readFileSync } = await import("node:fs");
    vi.mocked(readFileSync).mockReturnValue("secret-value\n");
    const { createStorageProvider } = await import("@studiometa/forge-core");
    vi.mocked(createStorageProvider).mockResolvedValue({ data: mockProvider });

    const ctx = createTestContext({
      mockClient: {} as never,
      options: {
        format: "json",
        name: "Backups",
        provider: "custom",
        endpoint: "https://s3.example.com",
        region: "eu-west-1",
        bucket: "my-bucket",
        directory: "backups",
        "access-key": "access-id",
        "secret-key-file": "-",
      },
    });

    await storageProvidersCreate(ctx);
    expect(vi.mocked(readFileSync)).toHaveBeenCalledWith(0, "utf8");
    expect(vi.mocked(createStorageProvider)).toHaveBeenCalledWith(
      {
        name: "Backups",
        provider: "custom",
        endpoint: "https://s3.example.com",
        region: "eu-west-1",
        bucket: "my-bucket",
        directory: "backups",
        access_key: "access-id",
        secret_key: "secret-value",
      },
      expect.anything(),
    );
    const output = vi
      .mocked(console.log)
      .mock.calls.map((c) => String(c[0]))
      .join("\n");
    expect(output).toContain('"id": 3');
    expect(output).not.toContain("secret-value");
  });

  it("should send only the name, the provider and assume_role", async () => {
    const { createStorageProvider } = await import("@studiometa/forge-core");
    vi.mocked(createStorageProvider).mockResolvedValue({ data: mockProvider });

    const ctx = createTestContext({
      mockClient: {} as never,
      options: { format: "json", name: "Backups", provider: "s3", "assume-role": true },
    });

    await storageProvidersCreate(ctx);
    expect(vi.mocked(createStorageProvider)).toHaveBeenCalledWith(
      { name: "Backups", provider: "s3", assume_role: true },
      expect.anything(),
    );
  });

  it("should exit with error when no name", async () => {
    const ctx = createTestContext({
      mockClient: {} as never,
      options: { format: "json", provider: "custom" },
    });

    await storageProvidersCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no provider", async () => {
    const ctx = createTestContext({
      mockClient: {} as never,
      options: { format: "json", name: "Backups" },
    });

    await storageProvidersCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error for an unknown provider type", async () => {
    const { createStorageProvider } = await import("@studiometa/forge-core");
    const ctx = createTestContext({
      mockClient: {} as never,
      options: { format: "json", name: "Backups", provider: "dropbox" },
    });

    await storageProvidersCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
    expect(vi.mocked(createStorageProvider)).not.toHaveBeenCalled();
  });

  it("should exit with error when an option has no value", async () => {
    const { createStorageProvider } = await import("@studiometa/forge-core");
    const ctx = createTestContext({
      mockClient: {} as never,
      options: { format: "json", name: "Backups", provider: "custom", endpoint: true },
    });

    await storageProvidersCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
    expect(vi.mocked(createStorageProvider)).not.toHaveBeenCalled();
  });

  it("should exit with error for an empty secret key", async () => {
    const { readFileSync } = await import("node:fs");
    vi.mocked(readFileSync).mockReturnValue("\n");
    const { createStorageProvider } = await import("@studiometa/forge-core");
    const ctx = createTestContext({
      mockClient: {} as never,
      options: {
        format: "json",
        name: "Backups",
        provider: "custom",
        "secret-key-file": "secret.txt",
      },
    });

    await storageProvidersCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
    expect(vi.mocked(createStorageProvider)).not.toHaveBeenCalled();
  });
});

describe("storageProvidersDelete", () => {
  it("should delete a storage provider", async () => {
    const { deleteStorageProvider } = await import("@studiometa/forge-core");
    vi.mocked(deleteStorageProvider).mockResolvedValue({ data: undefined });

    const ctx = createTestContext({ mockClient: {} as never, options: { format: "json" } });

    await storageProvidersDelete(["3"], ctx);
    expect(vi.mocked(deleteStorageProvider)).toHaveBeenCalledWith({ id: "3" }, expect.anything());
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining("deleted"));
  });

  it("should exit with error when no id", async () => {
    const ctx = createTestContext({ mockClient: {} as never, options: { format: "json" } });

    await storageProvidersDelete([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});
