import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleFirewallRulesCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  firewallRulesList: vi.fn().mockResolvedValue(undefined),
  firewallRulesGet: vi.fn().mockResolvedValue(undefined),
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

describe("handleFirewallRulesCommand routing", () => {
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
    await handleFirewallRulesCommand("list", [], {});
    expect(h.firewallRulesList).toHaveBeenCalled();
  });

  it("should route get with args", async () => {
    const h = await import("./handlers.ts");
    await handleFirewallRulesCommand("get", ["1"], {});
    expect(h.firewallRulesGet).toHaveBeenCalledWith(["1"], expect.anything());
  });

  it("should exit for unknown subcommand", async () => {
    await handleFirewallRulesCommand("unknown", [], {});
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
