import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleDatabaseUsersCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  databaseUsersList: vi.fn().mockResolvedValue(),
  databaseUsersGet: vi.fn().mockResolvedValue(),
  databaseUsersCreate: vi.fn().mockResolvedValue(),
  databaseUsersUpdate: vi.fn().mockResolvedValue(),
  databaseUsersDelete: vi.fn().mockResolvedValue(),
}));

vi.mock("../../context.ts", () => ({
  createContext: vi.fn().mockReturnValue({
    options: {},
    formatter: { output: vi.fn(), error: vi.fn() },
  }),
}));

vi.mock("../../output.ts", () => ({
  OutputFormatter: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.output = vi.fn();
    this.error = vi.fn();
  }),
}));

describe("handleDatabaseUsersCommand routing", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should route list", async () => {
    const h = await import("./handlers.ts");
    await handleDatabaseUsersCommand("list", [], {});
    expect(h.databaseUsersList).toHaveBeenCalled();
  });

  it("should route ls", async () => {
    const h = await import("./handlers.ts");
    await handleDatabaseUsersCommand("ls", [], {});
    expect(h.databaseUsersList).toHaveBeenCalled();
  });

  it("should route get with args", async () => {
    const h = await import("./handlers.ts");
    await handleDatabaseUsersCommand("get", ["1"], {});
    expect(h.databaseUsersGet).toHaveBeenCalledWith(["1"], expect.anything());
  });

  it("should route create", async () => {
    const h = await import("./handlers.ts");
    await handleDatabaseUsersCommand("create", [], {});
    expect(h.databaseUsersCreate).toHaveBeenCalled();
  });

  it("should route update with args", async () => {
    const h = await import("./handlers.ts");
    await handleDatabaseUsersCommand("update", ["1"], {});
    expect(h.databaseUsersUpdate).toHaveBeenCalledWith(["1"], expect.anything());
  });

  it("should route delete with args", async () => {
    const h = await import("./handlers.ts");
    await handleDatabaseUsersCommand("delete", ["1"], {});
    expect(h.databaseUsersDelete).toHaveBeenCalledWith(["1"], expect.anything());
  });

  it("should exit for unknown subcommand", async () => {
    await handleDatabaseUsersCommand("unknown", [], {});
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
