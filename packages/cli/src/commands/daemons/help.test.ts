import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { showDaemonsHelp } from "./help.ts";

describe("showDaemonsHelp", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show general help", () => {
    showDaemonsHelp();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("daemons"));
  });

  it("should show list help", () => {
    showDaemonsHelp("list");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("daemons list"));
  });

  it("should show list help for ls", () => {
    showDaemonsHelp("ls");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("daemons list"));
  });

  it("should show get help", () => {
    showDaemonsHelp("get");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("daemon_id"));
  });

  it("should show restart help", () => {
    showDaemonsHelp("restart");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("restart"));
  });
});
