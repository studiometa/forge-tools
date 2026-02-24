import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { ForgeFirewallRule } from "@studiometa/forge-api";

import { createTestContext } from "../../context.ts";
import { firewallRulesList, firewallRulesGet } from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  listFirewallRules: vi.fn(),
  getFirewallRule: vi.fn(),
}));

const mockRule: ForgeFirewallRule = {
  id: 1,
  server_id: 10,
  name: "Allow HTTP",
  port: 80,
  type: "allow",
  ip_address: "0.0.0.0",
  status: "installed",
  created_at: "2024-01-01T00:00:00Z",
};

describe("firewallRulesList", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should list firewall rules", async () => {
    const { listFirewallRules } = await import("@studiometa/forge-core");
    vi.mocked(listFirewallRules).mockResolvedValue({ data: [mockRule] });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await firewallRulesList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"Allow HTTP"'));
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await firewallRulesList(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("firewallRulesGet", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should get firewall rule", async () => {
    const { getFirewallRule } = await import("@studiometa/forge-core");
    vi.mocked(getFirewallRule).mockResolvedValue({ data: mockRule });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await firewallRulesGet(["1"], ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"Allow HTTP"'));
  });

  it("should exit with error when no rule id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await firewallRulesGet([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await firewallRulesGet(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});
