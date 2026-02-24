import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleDaemonsCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  daemonsList: vi.fn().mockResolvedValue(undefined),
  daemonsGet: vi.fn().mockResolvedValue(undefined),
  daemonsRestart: vi.fn().mockResolvedValue(undefined),
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

describe("handleDaemonsCommand routing", () => {
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
    await handleDaemonsCommand("list", [], {});
    expect(h.daemonsList).toHaveBeenCalled();
  });

  it("should route restart with args", async () => {
    const h = await import("./handlers.ts");
    await handleDaemonsCommand("restart", ["1"], {});
    expect(h.daemonsRestart).toHaveBeenCalledWith(["1"], expect.anything());
  });

  it("should exit for unknown subcommand", async () => {
    await handleDaemonsCommand("unknown", [], {});
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
