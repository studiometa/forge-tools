import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { showBackupsHelp } from "./help.ts";

describe("showBackupsHelp", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show general help", () => {
    showBackupsHelp();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("backups"));
  });

  it("should show list help", () => {
    showBackupsHelp("list");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("backups list"));
  });

  it("should show list help for ls", () => {
    showBackupsHelp("ls");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("backups list"));
  });

  it("should show get help", () => {
    showBackupsHelp("get");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("backup_id"));
  });

  it("should show create help", () => {
    showBackupsHelp("create");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("backups create"));
  });

  it("should show delete help", () => {
    showBackupsHelp("delete");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("backups delete"));
  });
});
