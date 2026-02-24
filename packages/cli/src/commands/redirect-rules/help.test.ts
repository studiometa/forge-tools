import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { showRedirectRulesHelp } from "./help.ts";

describe("showRedirectRulesHelp", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show general help", () => {
    showRedirectRulesHelp();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("redirect-rules"));
  });

  it("should show list help", () => {
    showRedirectRulesHelp("list");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("redirect-rules list"));
  });

  it("should show list help for ls", () => {
    showRedirectRulesHelp("ls");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("redirect-rules list"));
  });

  it("should show get help", () => {
    showRedirectRulesHelp("get");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("rule_id"));
  });

  it("should show create help", () => {
    showRedirectRulesHelp("create");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("redirect-rules create"));
  });

  it("should show delete help", () => {
    showRedirectRulesHelp("delete");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("redirect-rules delete"));
  });
});
