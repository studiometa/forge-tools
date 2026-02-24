import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { showSitesHelp } from "./help.ts";

describe("showSitesHelp", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show general help when no subcommand", () => {
    showSitesHelp();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("forge-cli sites"));
  });

  it("should show list help", () => {
    showSitesHelp("list");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("sites list"));
  });

  it("should show list help for ls", () => {
    showSitesHelp("ls");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("sites list"));
  });

  it("should show get help", () => {
    showSitesHelp("get");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("site_id"));
  });
});
