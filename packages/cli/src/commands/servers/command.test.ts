import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleServersCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  serversList: vi.fn().mockResolvedValue(undefined),
  serversGet: vi.fn().mockResolvedValue(undefined),
  serversReboot: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../context.ts", () => ({
  createContext: vi.fn().mockReturnValue({
    options: { format: "json" },
    formatter: { output: vi.fn(), error: vi.fn() },
    getToken: vi.fn().mockReturnValue("test-token"),
    createExecutorContext: vi.fn(),
  }),
}));

vi.mock("../../output.ts", () => ({
  OutputFormatter: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.output = vi.fn();
    this.error = vi.fn();
  }),
}));

describe("handleServersCommand routing", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    const handlers = await import("./handlers.ts");
    vi.mocked(handlers.serversList).mockClear();
    vi.mocked(handlers.serversGet).mockClear();
    vi.mocked(handlers.serversReboot).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should route list subcommand", async () => {
    const handlers = await import("./handlers.ts");
    await handleServersCommand("list", [], { format: "json" });
    expect(handlers.serversList).toHaveBeenCalled();
  });

  it("should route ls alias", async () => {
    const handlers = await import("./handlers.ts");
    await handleServersCommand("ls", [], {});
    expect(handlers.serversList).toHaveBeenCalled();
  });

  it("should route get subcommand with args", async () => {
    const handlers = await import("./handlers.ts");
    await handleServersCommand("get", ["123"], {});
    expect(handlers.serversGet).toHaveBeenCalledWith(["123"], expect.anything());
  });

  it("should route reboot subcommand with args", async () => {
    const handlers = await import("./handlers.ts");
    await handleServersCommand("reboot", ["123"], {});
    expect(handlers.serversReboot).toHaveBeenCalledWith(["123"], expect.anything());
  });

  it("should exit with error for unknown subcommand", async () => {
    await handleServersCommand("unknown", [], {});
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
