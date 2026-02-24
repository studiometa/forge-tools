import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleEnvCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  envGet: vi.fn().mockResolvedValue(undefined),
  envUpdate: vi.fn().mockResolvedValue(undefined),
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

describe("handleEnvCommand routing", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should route get", async () => {
    const h = await import("./handlers.ts");
    await handleEnvCommand("get", [], {});
    expect(h.envGet).toHaveBeenCalled();
  });

  it("should route update", async () => {
    const h = await import("./handlers.ts");
    await handleEnvCommand("update", [], {});
    expect(h.envUpdate).toHaveBeenCalled();
  });

  it("should exit for unknown subcommand", async () => {
    await handleEnvCommand("unknown", [], {});
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
