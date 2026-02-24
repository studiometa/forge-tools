import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { showCommandsHelp } from "./help.ts";

describe("showCommandsHelp", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show general help", () => {
    showCommandsHelp();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("commands"));
  });

  it("should show list help", () => {
    showCommandsHelp("list");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("commands list"));
  });

  it("should show list help for ls", () => {
    showCommandsHelp("ls");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("commands list"));
  });

  it("should show get help", () => {
    showCommandsHelp("get");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("command_id"));
  });

  it("should show create help", () => {
    showCommandsHelp("create");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("commands create"));
  });
});
