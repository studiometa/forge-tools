import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { showScheduledJobsHelp } from "./help.ts";

describe("showScheduledJobsHelp", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show general help", () => {
    showScheduledJobsHelp();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("scheduled-jobs"));
  });

  it("should show list help", () => {
    showScheduledJobsHelp("list");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("scheduled-jobs list"));
  });

  it("should show list help for ls", () => {
    showScheduledJobsHelp("ls");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("scheduled-jobs list"));
  });

  it("should show get help", () => {
    showScheduledJobsHelp("get");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("job_id"));
  });

  it("should show create help", () => {
    showScheduledJobsHelp("create");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("scheduled-jobs create"));
  });

  it("should document the create options with their defaults", () => {
    showScheduledJobsHelp("create");
    const output = consoleLogSpy.mock.calls.map((c) => c.join("")).join("");
    expect(output).toContain("--site <id>");
    expect(output).toContain("--user <user>");
    expect(output).toContain("(default: forge)");
    expect(output).toContain("--frequency <freq>");
    expect(output).toContain("minutely, hourly, nightly, weekly, monthly, reboot");
    expect(output).toContain("(default: custom)");
    expect(output).toContain("--cron <expr>");
  });

  it("should show delete help", () => {
    showScheduledJobsHelp("delete");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("scheduled-jobs delete"));
  });
});
