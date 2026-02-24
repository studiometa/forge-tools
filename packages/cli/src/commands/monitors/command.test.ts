import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleMonitorsCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  monitorsList: vi.fn().mockResolvedValue(undefined),
  monitorsGet: vi.fn().mockResolvedValue(undefined),
  monitorsCreate: vi.fn().mockResolvedValue(undefined),
  monitorsDelete: vi.fn().mockResolvedValue(undefined),
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

describe("handleMonitorsCommand routing", () => {
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
    await handleMonitorsCommand("list", [], {});
    expect(h.monitorsList).toHaveBeenCalled();
  });

  it("should route ls", async () => {
    const h = await import("./handlers.ts");
    await handleMonitorsCommand("ls", [], {});
    expect(h.monitorsList).toHaveBeenCalled();
  });

  it("should route get with args", async () => {
    const h = await import("./handlers.ts");
    await handleMonitorsCommand("get", ["1"], {});
    expect(h.monitorsGet).toHaveBeenCalledWith(["1"], expect.anything());
  });

  it("should route create", async () => {
    const h = await import("./handlers.ts");
    await handleMonitorsCommand("create", [], {});
    expect(h.monitorsCreate).toHaveBeenCalled();
  });

  it("should route delete with args", async () => {
    const h = await import("./handlers.ts");
    await handleMonitorsCommand("delete", ["1"], {});
    expect(h.monitorsDelete).toHaveBeenCalledWith(["1"], expect.anything());
  });

  it("should exit for unknown subcommand", async () => {
    await handleMonitorsCommand("unknown", [], {});
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
