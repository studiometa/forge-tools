import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { showMonitorsHelp } from "./help.ts";

describe("showMonitorsHelp", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show general help", () => {
    showMonitorsHelp();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("monitors"));
  });

  it("should show list help", () => {
    showMonitorsHelp("list");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("monitors list"));
  });

  it("should show list help for ls", () => {
    showMonitorsHelp("ls");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("monitors list"));
  });

  it("should show get help", () => {
    showMonitorsHelp("get");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("monitor_id"));
  });

  it("should show create help", () => {
    showMonitorsHelp("create");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("monitors create"));
  });

  it("should show delete help", () => {
    showMonitorsHelp("delete");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("monitors delete"));
  });
});
