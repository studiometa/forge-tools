import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { showUserHelp } from "./help.ts";

describe("showUserHelp", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show general help", () => {
    showUserHelp();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("user"));
  });

  it("should show get help", () => {
    showUserHelp("get");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("user get"));
  });
});
