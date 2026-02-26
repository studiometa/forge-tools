import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { ForgeDatabase } from "@studiometa/forge-api";

import { createTestContext } from "../../context.ts";
import { databasesList, databasesGet } from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  listDatabases: vi.fn(),
  getDatabase: vi.fn(),
}));

const mockDb: ForgeDatabase = {
  id: 1,
  server_id: 10,
  name: "mydb",
  status: "installed",
  created_at: "2024-01-01T00:00:00Z",
};

describe("databasesList", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should list databases", async () => {
    const { listDatabases } = await import("@studiometa/forge-core");
    vi.mocked(listDatabases).mockResolvedValue({ data: [mockDb] });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await databasesList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"mydb"'));
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await databasesList(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("databasesGet", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should get database by id", async () => {
    const { getDatabase } = await import("@studiometa/forge-core");
    vi.mocked(getDatabase).mockResolvedValue({ data: mockDb });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await databasesGet(["1"], ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"mydb"'));
  });

  it("should exit with error when no database_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await databasesGet([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await databasesGet(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("databasesList — human format lineFormat", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("should render human format with lineFormat callback", async () => {
    const { listDatabases } = await import("@studiometa/forge-core");
    vi.mocked(listDatabases).mockResolvedValue({ data: [mockDb] });
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10" },
    });
    await databasesList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalled();
  });
});
