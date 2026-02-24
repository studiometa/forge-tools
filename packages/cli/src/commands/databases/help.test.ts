import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { showDatabasesHelp } from "./help.ts";

describe("showDatabasesHelp", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show general help", () => {
    showDatabasesHelp();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("databases"));
  });

  it("should show list help", () => {
    showDatabasesHelp("list");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("databases list"));
  });

  it("should show list help for ls", () => {
    showDatabasesHelp("ls");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("databases list"));
  });

  it("should show get help", () => {
    showDatabasesHelp("get");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("database_id"));
  });
});
