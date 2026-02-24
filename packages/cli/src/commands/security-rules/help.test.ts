import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { showSecurityRulesHelp } from "./help.ts";

describe("showSecurityRulesHelp", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show general help", () => {
    showSecurityRulesHelp();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("security-rules"));
  });

  it("should show list help", () => {
    showSecurityRulesHelp("list");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("security-rules list"));
  });

  it("should show list help for ls", () => {
    showSecurityRulesHelp("ls");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("security-rules list"));
  });

  it("should show get help", () => {
    showSecurityRulesHelp("get");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("rule_id"));
  });

  it("should show create help", () => {
    showSecurityRulesHelp("create");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("security-rules create"));
  });

  it("should show delete help", () => {
    showSecurityRulesHelp("delete");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("security-rules delete"));
  });
});
