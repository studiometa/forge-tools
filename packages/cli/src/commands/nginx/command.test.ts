import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleNginxCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  nginxGet: vi.fn().mockResolvedValue(undefined),
  nginxUpdate: vi.fn().mockResolvedValue(undefined),
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

describe("handleNginxCommand routing", () => {
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
    await handleNginxCommand("get", [], {});
    expect(h.nginxGet).toHaveBeenCalled();
  });

  it("should route update", async () => {
    const h = await import("./handlers.ts");
    await handleNginxCommand("update", [], {});
    expect(h.nginxUpdate).toHaveBeenCalled();
  });

  it("should exit for unknown subcommand", async () => {
    await handleNginxCommand("unknown", [], {});
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
