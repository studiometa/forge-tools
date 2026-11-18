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

  it("should show list help", () => {
    showCertificatesHelp("list");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("certificates list"));
    showCertificatesHelp("ls");
    expect(consoleLogSpy).toHaveBeenCalledTimes(2);
  });

  it.each(["create", "delete", "deactivate"])("should show %s help", (subcommand) => {
    showCertificatesHelp(subcommand);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(`certificates ${subcommand}`),
    );
  });

  it("should show activate help", () => {
    showCertificatesHelp("activate");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("activate"));
  });
});
