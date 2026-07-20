import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { showDeploymentsHelp } from "./help.ts";

describe("showDeploymentsHelp", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show general help", () => {
    showDeploymentsHelp();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("deployments"));
  });

  it("should show list help", () => {
    showDeploymentsHelp("list");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("deployments list"));
  });

  it("should show list help for ls", () => {
    showDeploymentsHelp("ls");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("deployments list"));
  });

  it("should show deploy help", () => {
    showDeploymentsHelp("deploy");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("deploy"));
  });

  it("should show logs help", () => {
    showDeploymentsHelp("logs");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("deployments logs"));
  });

  it("should show logs help for log alias", () => {
    showDeploymentsHelp("log");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("deployments logs"));
  });
});
