import { describe, it, expect, vi, afterEach } from "vitest";

import { showGitHelp } from "./help.ts";

describe("showGitHelp", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show the help of git update", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    showGitHelp();
    expect(log).toHaveBeenCalledWith(expect.stringContaining("forge git update"));
  });
});
