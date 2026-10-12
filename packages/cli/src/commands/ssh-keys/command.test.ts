import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleSshKeysCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  sshKeysList: vi.fn().mockResolvedValue(),
  sshKeysGet: vi.fn().mockResolvedValue(),
}));

vi.mock("./sync.ts", () => ({
  sshKeysSync: vi.fn().mockResolvedValue(),
}));

vi.mock("../../audit.ts", () => ({
  getCliAuditLogger: vi.fn().mockReturnValue({ log: vi.fn() }),
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

describe("handleSshKeysCommand routing", () => {
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
    await handleSshKeysCommand("list", [], {});
    expect(h.sshKeysList).toHaveBeenCalled();
  });

  it("should route get with args", async () => {
    const h = await import("./handlers.ts");
    await handleSshKeysCommand("get", ["1"], {});
    expect(h.sshKeysGet).toHaveBeenCalledWith(["1"], expect.anything());
  });

  it("should route sync and record it in the audit log", async () => {
    const { sshKeysSync } = await import("./sync.ts");
    const { getCliAuditLogger } = await import("../../audit.ts");
    await handleSshKeysCommand("sync", [], { file: "keys", token: "secret" });
    expect(sshKeysSync).toHaveBeenCalled();
    expect(vi.mocked(getCliAuditLogger)().log).toHaveBeenCalledWith(
      expect.objectContaining({ resource: "ssh-keys", action: "sync", args: { file: "keys" } }),
    );
  });

  it("should exit for unknown subcommand", async () => {
    await handleSshKeysCommand("unknown", [], {});
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
