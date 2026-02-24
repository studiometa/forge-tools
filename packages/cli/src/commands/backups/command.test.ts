import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleBackupsCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  backupsList: vi.fn().mockResolvedValue(undefined),
  backupsGet: vi.fn().mockResolvedValue(undefined),
  backupsCreate: vi.fn().mockResolvedValue(undefined),
  backupsDelete: vi.fn().mockResolvedValue(undefined),
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

describe("handleBackupsCommand routing", () => {
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
    await handleBackupsCommand("list", [], {});
    expect(h.backupsList).toHaveBeenCalled();
  });

  it("should route ls", async () => {
    const h = await import("./handlers.ts");
    await handleBackupsCommand("ls", [], {});
    expect(h.backupsList).toHaveBeenCalled();
  });

  it("should route get with args", async () => {
    const h = await import("./handlers.ts");
    await handleBackupsCommand("get", ["1"], {});
    expect(h.backupsGet).toHaveBeenCalledWith(["1"], expect.anything());
  });

  it("should route create", async () => {
    const h = await import("./handlers.ts");
    await handleBackupsCommand("create", [], {});
    expect(h.backupsCreate).toHaveBeenCalled();
  });

  it("should route delete with args", async () => {
    const h = await import("./handlers.ts");
    await handleBackupsCommand("delete", ["1"], {});
    expect(h.backupsDelete).toHaveBeenCalledWith(["1"], expect.anything());
  });

  it("should exit for unknown subcommand", async () => {
    await handleBackupsCommand("unknown", [], {});
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
