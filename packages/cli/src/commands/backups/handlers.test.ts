import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { ForgeBackupConfig } from "@studiometa/forge-api";

import { createTestContext } from "../../context.ts";
import { backupsList, backupsGet, backupsCreate, backupsDelete } from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  listBackupConfigs: vi.fn(),
  getBackupConfig: vi.fn(),
  createBackupConfig: vi.fn(),
  deleteBackupConfig: vi.fn(),
}));

const mockBackup: ForgeBackupConfig = {
  id: 1,
  server_id: 10,
  day_of_week: null,
  time: null,
  provider: "s3",
  provider_name: "Amazon S3",
  databases: [],
  frequency: "weekly",
  directory: null,
  email: null,
  retention: 5,
  status: "active",
  created_at: "2024-01-01T00:00:00Z",
};

describe("backupsList", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should list backup configurations", async () => {
    const { listBackupConfigs } = await import("@studiometa/forge-core");
    vi.mocked(listBackupConfigs).mockResolvedValue({ data: [mockBackup] });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await backupsList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"s3"'));
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await backupsList(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("backupsGet", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should get backup configuration by id", async () => {
    const { getBackupConfig } = await import("@studiometa/forge-core");
    vi.mocked(getBackupConfig).mockResolvedValue({ data: mockBackup });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await backupsGet(["1"], ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"s3"'));
  });

  it("should exit with error when no backup_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await backupsGet([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await backupsGet(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("backupsCreate", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a backup configuration", async () => {
    const { createBackupConfig } = await import("@studiometa/forge-core");
    vi.mocked(createBackupConfig).mockResolvedValue({ data: mockBackup });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", provider: "s3", frequency: "weekly" },
    });

    await backupsCreate(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"s3"'));
  });

  it("should create with databases array", async () => {
    const { createBackupConfig } = await import("@studiometa/forge-core");
    vi.mocked(createBackupConfig).mockResolvedValue({ data: mockBackup });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: {
        format: "json",
        server: "10",
        provider: "s3",
        frequency: "weekly",
        databases: ["1", "2"],
      },
    });

    await backupsCreate(ctx);
    expect(vi.mocked(createBackupConfig)).toHaveBeenCalledWith(
      expect.objectContaining({ databases: [1, 2] }),
      expect.anything(),
    );
  });

  it("should create with single database", async () => {
    const { createBackupConfig } = await import("@studiometa/forge-core");
    vi.mocked(createBackupConfig).mockResolvedValue({ data: mockBackup });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: {
        format: "json",
        server: "10",
        provider: "s3",
        frequency: "weekly",
        databases: "1",
      },
    });

    await backupsCreate(ctx);
    expect(vi.mocked(createBackupConfig)).toHaveBeenCalledWith(
      expect.objectContaining({ databases: [1] }),
      expect.anything(),
    );
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", provider: "s3", frequency: "weekly" },
    });

    await backupsCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no provider", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", frequency: "weekly" },
    });

    await backupsCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no frequency", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", provider: "s3" },
    });

    await backupsCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("backupsDelete", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should delete a backup configuration", async () => {
    const { deleteBackupConfig } = await import("@studiometa/forge-core");
    vi.mocked(deleteBackupConfig).mockResolvedValue({ data: undefined });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await backupsDelete(["1"], ctx);
    expect(vi.mocked(deleteBackupConfig)).toHaveBeenCalledWith(
      { server_id: "10", id: "1" },
      expect.anything(),
    );
  });

  it("should exit with error when no backup_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await backupsDelete([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await backupsDelete(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});
