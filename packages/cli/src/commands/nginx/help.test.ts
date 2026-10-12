import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { showNginxHelp } from "./help.ts";

describe("showNginxHelp", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show general help", () => {
    showNginxHelp();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("nginx"));
  });

  it("should show get help", () => {
    showNginxHelp("get");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("nginx get"));
  });

  it("should show update help", () => {
    showNginxHelp("update");
    const output = String(consoleLogSpy.mock.calls[0][0]);
    expect(output).toContain("nginx update");
    expect(output).toContain("--file <path>");
    expect(output).toContain("--check");
  });
});
