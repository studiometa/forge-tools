import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { showDatabaseUsersHelp } from "./help.ts";

describe("showDatabaseUsersHelp", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show general help", () => {
    showDatabaseUsersHelp();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("database-users"));
  });

  it("should show list help", () => {
    showDatabaseUsersHelp("list");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("database-users list"));
  });

  it("should show list help for ls", () => {
    showDatabaseUsersHelp("ls");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("database-users list"));
  });

  it("should show get help", () => {
    showDatabaseUsersHelp("get");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("user_id"));
  });

  it("should show create help", () => {
    showDatabaseUsersHelp("create");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("database-users create"));
  });

  it("should show delete help", () => {
    showDatabaseUsersHelp("delete");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("database-users delete"));
  });
});
