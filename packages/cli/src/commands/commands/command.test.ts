import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleCommandsCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  commandsList: vi.fn().mockResolvedValue(undefined),
  commandsGet: vi.fn().mockResolvedValue(undefined),
  commandsCreate: vi.fn().mockResolvedValue(undefined),
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

describe("handleCommandsCommand routing", () => {
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
    await handleCommandsCommand("list", [], {});
    expect(h.commandsList).toHaveBeenCalled();
  });

  it("should route ls", async () => {
    const h = await import("./handlers.ts");
    await handleCommandsCommand("ls", [], {});
    expect(h.commandsList).toHaveBeenCalled();
  });

  it("should route get with args", async () => {
    const h = await import("./handlers.ts");
    await handleCommandsCommand("get", ["1"], {});
    expect(h.commandsGet).toHaveBeenCalledWith(["1"], expect.anything());
  });

  it("should route create", async () => {
    const h = await import("./handlers.ts");
    await handleCommandsCommand("create", [], {});
    expect(h.commandsCreate).toHaveBeenCalled();
  });

  it("should exit for unknown subcommand", async () => {
    await handleCommandsCommand("unknown", [], {});
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
