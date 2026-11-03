import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { OutputFormatter } from "../output.ts";
import { reportDrift, reportTextDrift } from "./drift.ts";

describe("reportDrift", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.exitCode = undefined;
  });

  it("should print in sync and not exit in human format", () => {
    reportDrift("deployment script", null, new OutputFormatter("human", true));
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Deployment script is in sync with Forge."),
    );
    expect(processExitSpy).not.toHaveBeenCalled();
    expect(process.exitCode).toBeUndefined();
  });

  it("should print the diff and exit 1 in human format", () => {
    reportDrift(
      "deployment script",
      { text: "-a\n+b", json: "-a\n+b" },
      new OutputFormatter("human", true),
    );
    expect(console.log).toHaveBeenCalledWith("-a\n+b");
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Deployment script differs from Forge."),
    );
    expect(process.exitCode).toBe(1);
    expect(processExitSpy).not.toHaveBeenCalled();
  });

  it("should print { inSync: true } in json format", () => {
    reportDrift("deployment script", null, new OutputFormatter("json", true));
    expect(console.log).toHaveBeenCalledWith(JSON.stringify({ inSync: true }, null, 2));
    expect(processExitSpy).not.toHaveBeenCalled();
    expect(process.exitCode).toBeUndefined();
  });

  it("should print { inSync: false, diff } and exit 1 in json format", () => {
    reportDrift(
      "environment file",
      { text: "+ A (added)", json: { added: ["A"] } },
      new OutputFormatter("json", true),
    );
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify({ inSync: false, diff: { added: ["A"] } }, null, 2),
    );
    expect(console.error).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
    expect(processExitSpy).not.toHaveBeenCalled();
  });
});

describe("reportTextDrift", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.exitCode = undefined;
  });

  it("should report in sync for equal content", () => {
    reportTextDrift("nginx configuration", "a\r\n", "a", new OutputFormatter("json", true));
    expect(console.log).toHaveBeenCalledWith(JSON.stringify({ inSync: true }, null, 2));
    expect(processExitSpy).not.toHaveBeenCalled();
    expect(process.exitCode).toBeUndefined();
  });

  it("should report the unified diff as a string", () => {
    reportTextDrift("nginx configuration", "a", "b", new OutputFormatter("json", true));
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify(
        { inSync: false, diff: "--- remote\n+++ local\n@@ -1,1 +1,1 @@\n-a\n+b" },
        null,
        2,
      ),
    );
    expect(process.exitCode).toBe(1);
    expect(processExitSpy).not.toHaveBeenCalled();
  });
});
