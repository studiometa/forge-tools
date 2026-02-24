import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { showFirewallRulesHelp } from "./help.ts";

describe("showFirewallRulesHelp", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show general help", () => {
    showFirewallRulesHelp();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("firewall-rules"));
  });

  it("should show list help", () => {
    showFirewallRulesHelp("list");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("firewall-rules list"));
  });

  it("should show list help for ls", () => {
    showFirewallRulesHelp("ls");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("firewall-rules list"));
  });

  it("should show get help", () => {
    showFirewallRulesHelp("get");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("rule_id"));
  });
});
