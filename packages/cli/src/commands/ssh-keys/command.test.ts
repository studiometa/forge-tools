import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleSshKeysCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  sshKeysList: vi.fn().mockResolvedValue(undefined),
  sshKeysGet: vi.fn().mockResolvedValue(undefined),
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

  it("should exit for unknown subcommand", async () => {
    await handleSshKeysCommand("unknown", [], {});
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
