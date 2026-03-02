import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { showServersHelp } from "./help.ts";

describe("showServersHelp", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show general help when no subcommand", () => {
    showServersHelp();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("forge servers"));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("list"));
  });

  it("should show list help for list subcommand", () => {
    showServersHelp("list");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("servers list"));
  });

  it("should show list help for ls alias", () => {
    showServersHelp("ls");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("servers list"));
  });

  it("should show get help", () => {
    showServersHelp("get");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("server_id"));
  });

  it("should show reboot help", () => {
    showServersHelp("reboot");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("reboot"));
  });
});
