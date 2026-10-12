import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { OutputFormatter } from "../output.ts";
import { normalizeContent, reportDrift, reportTextDrift, unifiedDiff } from "./drift.ts";

const lines = (count: number) => Array.from({ length: count }, (_, i) => `line ${i + 1}`);

describe("normalizeContent", () => {
  it("should convert CRLF to LF", () => {
    expect(normalizeContent("a\r\nb")).toBe("a\nb");
  });

  it("should drop a single trailing newline", () => {
    expect(normalizeContent("a\n")).toBe("a");
    expect(normalizeContent("a\n\n")).toBe("a\n");
    expect(normalizeContent("a\r\n")).toBe("a");
  });
});

describe("unifiedDiff", () => {
  it("should return an empty string for equal content", () => {
    expect(unifiedDiff("a\nb", "a\nb")).toBe("");
    expect(unifiedDiff("", "")).toBe("");
  });

  it("should ignore line endings and a single trailing newline", () => {
    expect(unifiedDiff("a\r\nb\r\n", "a\nb")).toBe("");
    expect(unifiedDiff("a\nb", "a\nb\n")).toBe("");
  });

  it("should not ignore more than one trailing newline", () => {
    expect(unifiedDiff("a", "a\n\n")).toBe(
      ["--- remote", "+++ local", "@@ -1,1 +1,2 @@", " a", "+"].join("\n"),
    );
  });

  it("should mark remote lines with - and local lines with +", () => {
    expect(unifiedDiff("a\nb\nc", "a\nx\nc")).toBe(
      ["--- remote", "+++ local", "@@ -1,3 +1,3 @@", " a", "-b", "+x", " c"].join("\n"),
    );
  });

  it("should keep three lines of context and split distant changes into hunks", () => {
    const remote = lines(20);
    const local = [...remote];
    local[1] = "changed 2";
    local.splice(15, 1);
    local.push("new end");

    expect(unifiedDiff(remote.join("\n"), local.join("\n"))).toBe(
      [
        "--- remote",
        "+++ local",
        "@@ -1,5 +1,5 @@",
        " line 1",
        "-line 2",
        "+changed 2",
        " line 3",
        " line 4",
        " line 5",
        "@@ -13,8 +13,8 @@",
        " line 13",
        " line 14",
        " line 15",
        "-line 16",
        " line 17",
        " line 18",
        " line 19",
        " line 20",
        "+new end",
      ].join("\n"),
    );
  });

  it("should merge changes separated by six unchanged lines or fewer", () => {
    const remote = lines(10);
    const local = [...remote];
    local[0] = "first";
    local[7] = "eighth";

    const result = unifiedDiff(remote.join("\n"), local.join("\n"));
    expect(result.match(/^@@/gm)).toHaveLength(1);
    expect(result).toContain("@@ -1,10 +1,10 @@");
  });

  it("should point an empty side at line 0", () => {
    expect(unifiedDiff("", "a\nb")).toBe(
      ["--- remote", "+++ local", "@@ -0,0 +1,2 @@", "+a", "+b"].join("\n"),
    );
    expect(unifiedDiff("a", "")).toBe(
      ["--- remote", "+++ local", "@@ -1,1 +0,0 @@", "-a"].join("\n"),
    );
  });
});

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
