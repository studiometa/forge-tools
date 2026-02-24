import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleSecurityRulesCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  securityRulesList: vi.fn().mockResolvedValue(undefined),
  securityRulesGet: vi.fn().mockResolvedValue(undefined),
  securityRulesCreate: vi.fn().mockResolvedValue(undefined),
  securityRulesDelete: vi.fn().mockResolvedValue(undefined),
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

describe("handleSecurityRulesCommand routing", () => {
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
    await handleSecurityRulesCommand("list", [], {});
    expect(h.securityRulesList).toHaveBeenCalled();
  });

  it("should route ls", async () => {
    const h = await import("./handlers.ts");
    await handleSecurityRulesCommand("ls", [], {});
    expect(h.securityRulesList).toHaveBeenCalled();
  });

  it("should route get with args", async () => {
    const h = await import("./handlers.ts");
    await handleSecurityRulesCommand("get", ["1"], {});
    expect(h.securityRulesGet).toHaveBeenCalledWith(["1"], expect.anything());
  });

  it("should route create", async () => {
    const h = await import("./handlers.ts");
    await handleSecurityRulesCommand("create", [], {});
    expect(h.securityRulesCreate).toHaveBeenCalled();
  });

  it("should route delete with args", async () => {
    const h = await import("./handlers.ts");
    await handleSecurityRulesCommand("delete", ["1"], {});
    expect(h.securityRulesDelete).toHaveBeenCalledWith(["1"], expect.anything());
  });

  it("should exit for unknown subcommand", async () => {
    await handleSecurityRulesCommand("unknown", [], {});
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
