import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { showServicesHelp } from "./help.ts";

describe("showServicesHelp", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show general help", () => {
    showServicesHelp();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("services"));
  });

  it("should show list help", () => {
    showServicesHelp("list");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("services list"));
  });

  it("should show list help for ls", () => {
    showServicesHelp("ls");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("services list"));
  });

  it("should show restart help", () => {
    showServicesHelp("restart");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("services restart"));
  });

  it("should mention --version for restart", () => {
    showServicesHelp("restart");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("--version"));
  });
});
