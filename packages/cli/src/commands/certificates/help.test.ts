import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { showCertificatesHelp } from "./help.ts";

describe("showCertificatesHelp", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show general help", () => {
    showCertificatesHelp();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("certificates"));
  });

  it("should show get help", () => {
    showCertificatesHelp("get");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("certificates get"));
  });

  it("should show activate help", () => {
    showCertificatesHelp("activate");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("activate"));
  });
});
