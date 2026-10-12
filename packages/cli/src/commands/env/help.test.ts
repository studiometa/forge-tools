import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { showEnvHelp } from "./help.ts";

describe("showEnvHelp", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show general help", () => {
    showEnvHelp();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("env"));
  });

  it("should show get help", () => {
    showEnvHelp("get");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("env get"));
  });

  it("should show update help", () => {
    showEnvHelp("update");
    const output = String(consoleLogSpy.mock.calls[0][0]);
    expect(output).toContain("env update");
    expect(output).toContain("--file <path>");
  });
});
