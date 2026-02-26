import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { ForgeDatabaseUser } from "@studiometa/forge-api";

import { createTestContext } from "../../context.ts";
import {
  databaseUsersList,
  databaseUsersGet,
  databaseUsersCreate,
  databaseUsersDelete,
} from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  listDatabaseUsers: vi.fn(),
  getDatabaseUser: vi.fn(),
  createDatabaseUser: vi.fn(),
  deleteDatabaseUser: vi.fn(),
}));

const mockUser: ForgeDatabaseUser = {
  id: 1,
  server_id: 10,
  name: "forge",
  status: "installed",
  databases: [],
  created_at: "2024-01-01T00:00:00Z",
};

describe("databaseUsersList", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should list database users", async () => {
    const { listDatabaseUsers } = await import("@studiometa/forge-core");
    vi.mocked(listDatabaseUsers).mockResolvedValue({ data: [mockUser] });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await databaseUsersList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"forge"'));
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await databaseUsersList(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("databaseUsersGet", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should get database user by id", async () => {
    const { getDatabaseUser } = await import("@studiometa/forge-core");
    vi.mocked(getDatabaseUser).mockResolvedValue({ data: mockUser });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await databaseUsersGet(["1"], ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"forge"'));
  });

  it("should exit with error when no user_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await databaseUsersGet([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await databaseUsersGet(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("databaseUsersCreate", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a database user", async () => {
    const { createDatabaseUser } = await import("@studiometa/forge-core");
    vi.mocked(createDatabaseUser).mockResolvedValue({ data: mockUser });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", name: "forge", password: "secret" },
    });

    await databaseUsersCreate(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"forge"'));
  });

  it("should create a database user with databases array", async () => {
    const { createDatabaseUser } = await import("@studiometa/forge-core");
    vi.mocked(createDatabaseUser).mockResolvedValue({ data: { ...mockUser, databases: [1, 2] } });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: {
        format: "json",
        server: "10",
        name: "forge",
        password: "secret",
        databases: ["1", "2"],
      },
    });

    await databaseUsersCreate(ctx);
    expect(vi.mocked(createDatabaseUser)).toHaveBeenCalledWith(
      expect.objectContaining({ databases: [1, 2] }),
      expect.anything(),
    );
  });

  it("should create a database user with single database", async () => {
    const { createDatabaseUser } = await import("@studiometa/forge-core");
    vi.mocked(createDatabaseUser).mockResolvedValue({ data: { ...mockUser, databases: [1] } });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", name: "forge", password: "secret", databases: "1" },
    });

    await databaseUsersCreate(ctx);
    expect(vi.mocked(createDatabaseUser)).toHaveBeenCalledWith(
      expect.objectContaining({ databases: [1] }),
      expect.anything(),
    );
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", name: "forge", password: "secret" },
    });

    await databaseUsersCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no name", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", password: "secret" },
    });

    await databaseUsersCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no password", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", name: "forge" },
    });

    await databaseUsersCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("databaseUsersDelete", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should delete a database user", async () => {
    const { deleteDatabaseUser } = await import("@studiometa/forge-core");
    vi.mocked(deleteDatabaseUser).mockResolvedValue({ data: undefined });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await databaseUsersDelete(["1"], ctx);
    expect(vi.mocked(deleteDatabaseUser)).toHaveBeenCalledWith(
      { server_id: "10", id: "1" },
      expect.anything(),
    );
  });

  it("should exit with error when no user_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await databaseUsersDelete([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await databaseUsersDelete(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("databaseUsersList — human format lineFormat", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("should render human format with lineFormat callback", async () => {
    const { listDatabaseUsers } = await import("@studiometa/forge-core");
    vi.mocked(listDatabaseUsers).mockResolvedValue({ data: [mockUser] });
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10" },
    });
    await databaseUsersList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalled();
  });
});
