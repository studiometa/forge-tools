import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { BackupConfigAttributes } from "@studiometa/forge-api";

import { createTestContext } from "../../context.ts";
import {
  backupsList,
  backupsGet,
  backupsCreate,
  backupsUpdate,
  backupsDelete,
} from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  listBackupConfigs: vi.fn(),
  getBackupConfig: vi.fn(),
  createBackupConfig: vi.fn(),
  updateBackupConfig: vi.fn(),
  deleteBackupConfig: vi.fn(),
  listDatabases: vi.fn(),
  listStorageProviders: vi.fn(),
}));

const mockBackup: BackupConfigAttributes & { id: number } = {
  id: 1,
  name: "Amazon S3",
  storage_provider_id: null,
  provider: "s3",
  bucket: null,
  directory: "/backups",
  schedule: "weekly",
  displayable_schedule: "Weekly",
  next_run_time: "2024-01-16",
  status: "active",
  day_of_week: null,
  time: null,
  cron_schedule: null,
  retention: 5,
  notify_email: null,
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
    vi.mocked(createBackupConfig).mockResolvedValue({ data: undefined });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: {
        format: "json",
        server: "10",
        "storage-provider": "1",
        frequency: "weekly",
        databases: "1",
      },
    });

    await backupsCreate(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining("created"));
    expect(vi.mocked(createBackupConfig)).toHaveBeenCalledWith(
      {
        server_id: "10",
        storage_provider_id: 1,
        frequency: "weekly",
        retention: 5,
        database_ids: [1],
      },
      expect.anything(),
    );
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
        "storage-provider": "1",
        frequency: "weekly",
        databases: ["1", "2"],
      },
    });

    await backupsCreate(ctx);
    expect(vi.mocked(createBackupConfig)).toHaveBeenCalledWith(
      expect.objectContaining({ database_ids: [1, 2] }),
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
        "storage-provider": "1",
        frequency: "weekly",
        databases: "1",
      },
    });

    await backupsCreate(ctx);
    expect(vi.mocked(createBackupConfig)).toHaveBeenCalledWith(
      expect.objectContaining({ database_ids: [1] }),
      expect.anything(),
    );
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", "storage-provider": "1", frequency: "weekly" },
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
      options: { format: "json", server: "10", "storage-provider": "1" },
    });

    await backupsCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("backupsUpdate", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should update a backup configuration", async () => {
    const { updateBackupConfig } = await import("@studiometa/forge-core");
    vi.mocked(updateBackupConfig).mockResolvedValue({ data: undefined });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: {
        format: "json",
        server: "10",
        "storage-provider": "1",
        frequency: "weekly",
        retention: "7",
        databases: ["1", "2"],
      },
    });

    await backupsUpdate(["5"], ctx);
    expect(vi.mocked(updateBackupConfig)).toHaveBeenCalledWith(
      expect.objectContaining({
        server_id: "10",
        id: "5",
        storage_provider_id: 1,
        frequency: "weekly",
        retention: 7,
        database_ids: [1, 2],
      }),
      expect.anything(),
    );
  });

  it("should exit with error when no backup_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: {
        format: "json",
        server: "10",
        "storage-provider": "1",
        frequency: "weekly",
        retention: "7",
        databases: "1",
      },
    });

    await backupsUpdate([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: {
        format: "json",
        "storage-provider": "1",
        frequency: "weekly",
        retention: "7",
        databases: "1",
      },
    });

    await backupsUpdate(["5"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no provider", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", frequency: "weekly", retention: "7" },
    });

    await backupsUpdate(["5"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no frequency", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", "storage-provider": "1", retention: "7" },
    });

    await backupsUpdate(["5"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should update with optional fields", async () => {
    const { updateBackupConfig } = await import("@studiometa/forge-core");
    vi.mocked(updateBackupConfig).mockResolvedValue({ data: undefined });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: {
        format: "json",
        server: "10",
        "storage-provider": "1",
        frequency: "daily",
        retention: "14",
        databases: "3",
        name: "my-backup",
        bucket: "s3-bucket",
        directory: "/backups",
        day: "1",
        time: "03:00",
        cron: "0 3 * * *",
        "notification-email": "admin@example.com",
      },
    });

    await backupsUpdate(["5"], ctx);
    expect(vi.mocked(updateBackupConfig)).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "my-backup",
        bucket: "s3-bucket",
        directory: "/backups",
        day: "1",
        time: "03:00",
        cron: "0 3 * * *",
        notification_email: "admin@example.com",
        database_ids: [3],
      }),
      expect.anything(),
    );
  });

  it("should exit with error when no retention", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", "storage-provider": "1", frequency: "weekly" },
    });

    await backupsUpdate(["5"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no databases", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: {
        format: "json",
        server: "10",
        "storage-provider": "1",
        frequency: "weekly",
        retention: "7",
      },
    });

    await backupsUpdate(["5"], ctx).catch(() => {});
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

describe("backupsList — human format lineFormat", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("should render human format with lineFormat callback", async () => {
    const { listBackupConfigs } = await import("@studiometa/forge-core");
    vi.mocked(listBackupConfigs).mockResolvedValue({ data: [mockBackup] });
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10" },
    });
    await backupsList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalled();
  });
});

describe("backupsCreate — options", () => {
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

  it("should send the schedule, retention, location and databases", async () => {
    const { createBackupConfig } = await import("@studiometa/forge-core");
    vi.mocked(createBackupConfig).mockResolvedValue({ data: undefined });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: {
        format: "json",
        server: "10",
        "storage-provider": "3",
        frequency: "daily",
        time: "02:00",
        retention: "7",
        bucket: "my-bucket",
        directory: "web-1",
        name: "nightly",
        "notification-email": "ops@example.com",
        "include-new-databases": true,
        databases: ["1,2", "3"],
      },
    });

    await backupsCreate(ctx);
    expect(vi.mocked(createBackupConfig)).toHaveBeenCalledWith(
      {
        server_id: "10",
        storage_provider_id: 3,
        frequency: "daily",
        time: "02:00",
        retention: 7,
        bucket: "my-bucket",
        directory: "web-1",
        name: "nightly",
        notification_email: "ops@example.com",
        include_new_databases: true,
        database_ids: [1, 2, 3],
      },
      expect.anything(),
    );
  });

  it("should resolve the storage provider and databases by name", async () => {
    const { createBackupConfig, listDatabases, listStorageProviders } =
      await import("@studiometa/forge-core");
    vi.mocked(createBackupConfig).mockResolvedValue({ data: undefined });
    vi.mocked(listStorageProviders).mockResolvedValue({
      data: [
        { id: 3, name: "Backups" },
        { id: 4, name: "Archive" },
      ] as never,
    });
    vi.mocked(listDatabases).mockResolvedValue({
      data: [
        { id: 11, name: "app" },
        { id: 12, name: "wordpress" },
      ] as never,
    });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: {
        format: "json",
        server: "10",
        "storage-provider": "Backups",
        frequency: "daily",
        databases: "app,12",
      },
    });

    await backupsCreate(ctx);
    expect(vi.mocked(listDatabases)).toHaveBeenCalledWith({ server_id: "10" }, expect.anything());
    expect(vi.mocked(createBackupConfig)).toHaveBeenCalledWith(
      expect.objectContaining({ storage_provider_id: 3, database_ids: [11, 12] }),
      expect.anything(),
    );
  });

  it("should fail for an unknown storage provider name", async () => {
    const { createBackupConfig, listStorageProviders } = await import("@studiometa/forge-core");
    vi.mocked(listStorageProviders).mockResolvedValue({ data: [] });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: {
        format: "json",
        server: "10",
        "storage-provider": "Missing",
        frequency: "daily",
        databases: "1",
      },
    });

    await backupsCreate(ctx);
    expect(processExitSpy).toHaveBeenCalledWith(3);
    expect(vi.mocked(createBackupConfig)).not.toHaveBeenCalled();
  });

  it("should fail when several storage providers have the name", async () => {
    const { createBackupConfig, listStorageProviders } = await import("@studiometa/forge-core");
    vi.mocked(listStorageProviders).mockResolvedValue({
      data: [
        { id: 3, name: "Backups" },
        { id: 4, name: "Backups" },
      ] as never,
    });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: {
        format: "json",
        server: "10",
        "storage-provider": "Backups",
        frequency: "daily",
        databases: "1",
      },
    });

    await backupsCreate(ctx);
    expect(processExitSpy).toHaveBeenCalledWith(3);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining("3, 4"));
    expect(vi.mocked(createBackupConfig)).not.toHaveBeenCalled();
  });

  it("should fail for an unknown database name", async () => {
    const { createBackupConfig, listDatabases } = await import("@studiometa/forge-core");
    vi.mocked(listDatabases).mockResolvedValue({ data: [{ id: 11, name: "app" }] as never });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: {
        format: "json",
        server: "10",
        "storage-provider": "3",
        frequency: "daily",
        databases: "app,shop",
      },
    });

    await backupsCreate(ctx);
    expect(processExitSpy).toHaveBeenCalledWith(3);
    expect(vi.mocked(createBackupConfig)).not.toHaveBeenCalled();
  });

  it("should exit with error when no databases", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", "storage-provider": "3", frequency: "daily" },
    });

    await backupsCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should fail for an unknown frequency", async () => {
    const { createBackupConfig } = await import("@studiometa/forge-core");

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: {
        format: "json",
        server: "10",
        "storage-provider": "3",
        frequency: "monthly",
        databases: "1",
      },
    });

    await backupsCreate(ctx);
    expect(processExitSpy).toHaveBeenCalledWith(3);
    expect(vi.mocked(createBackupConfig)).not.toHaveBeenCalled();
  });

  it.each(["0", "8761", "1.5", "seven"])("should fail for retention %s", async (retention) => {
    const { createBackupConfig } = await import("@studiometa/forge-core");

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: {
        format: "json",
        server: "10",
        "storage-provider": "3",
        frequency: "daily",
        retention,
        databases: "1",
      },
    });

    await backupsCreate(ctx);
    expect(processExitSpy).toHaveBeenCalledWith(3);
    expect(vi.mocked(createBackupConfig)).not.toHaveBeenCalled();
  });
});
