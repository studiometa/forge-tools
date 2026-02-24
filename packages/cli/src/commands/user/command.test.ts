import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleUserCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  userGet: vi.fn().mockResolvedValue(undefined),
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

describe("handleUserCommand routing", () => {
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
    await handleUserCommand("get", [], {});
    expect(h.userGet).toHaveBeenCalled();
  });

  it("should exit for unknown subcommand", async () => {
    await handleUserCommand("unknown", [], {});
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
