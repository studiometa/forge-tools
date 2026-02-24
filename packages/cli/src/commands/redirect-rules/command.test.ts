import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleRedirectRulesCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  redirectRulesList: vi.fn().mockResolvedValue(undefined),
  redirectRulesGet: vi.fn().mockResolvedValue(undefined),
  redirectRulesCreate: vi.fn().mockResolvedValue(undefined),
  redirectRulesDelete: vi.fn().mockResolvedValue(undefined),
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

describe("handleRedirectRulesCommand routing", () => {
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
    await handleRedirectRulesCommand("list", [], {});
    expect(h.redirectRulesList).toHaveBeenCalled();
  });

  it("should route ls", async () => {
    const h = await import("./handlers.ts");
    await handleRedirectRulesCommand("ls", [], {});
    expect(h.redirectRulesList).toHaveBeenCalled();
  });

  it("should route get with args", async () => {
    const h = await import("./handlers.ts");
    await handleRedirectRulesCommand("get", ["1"], {});
    expect(h.redirectRulesGet).toHaveBeenCalledWith(["1"], expect.anything());
  });

  it("should route create", async () => {
    const h = await import("./handlers.ts");
    await handleRedirectRulesCommand("create", [], {});
    expect(h.redirectRulesCreate).toHaveBeenCalled();
  });

  it("should route delete with args", async () => {
    const h = await import("./handlers.ts");
    await handleRedirectRulesCommand("delete", ["1"], {});
    expect(h.redirectRulesDelete).toHaveBeenCalledWith(["1"], expect.anything());
  });

  it("should exit for unknown subcommand", async () => {
    await handleRedirectRulesCommand("unknown", [], {});
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
