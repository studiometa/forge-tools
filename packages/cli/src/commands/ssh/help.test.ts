import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { showSshHelp } from "./help.ts";

describe("showSshHelp", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("documents the command, the --user flag and the default user", () => {
    showSshHelp();
    const output = consoleLogSpy.mock.calls[0][0] as string;
    expect(output).toContain("forge ssh");
    expect(output).toContain("--user");
    expect(output).toContain("default: forge");
    expect(output).toContain("--private");
  });
});
