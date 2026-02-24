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

  it("should show delete help", () => {
    showScheduledJobsHelp("delete");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("scheduled-jobs delete"));
  });
});
