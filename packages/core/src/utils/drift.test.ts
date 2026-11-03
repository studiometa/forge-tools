import { describe, it, expect } from "vitest";

import {
  compareEnv,
  compareText,
  diffEnv,
  formatEnvDiff,
  normalizeContent,
  parseEnv,
  unifiedDiff,
} from "./drift.ts";

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

describe("parseEnv", () => {
  it("should parse KEY=VALUE lines and skip comments, blank lines and lines without a key", () => {
    const vars = parseEnv(
      [
        "# comment",
        "",
        "APP_ENV=production",
        "  DB_HOST = 127.0.0.1  ",
        "=nokey",
        "garbage",
        "URL=a=b",
      ].join("\r\n"),
    );
    expect([...vars]).toEqual([
      ["APP_ENV", "production"],
      ["DB_HOST", "127.0.0.1"],
      ["URL", "a=b"],
    ]);
  });

  it("should skip lines whose name is not a valid variable name", () => {
    expect([...parseEnv("1A=1\nA-B=2\na/b=3\nA.B=4\n_A=5")]).toEqual([
      ["A.B", "4"],
      ["_A", "5"],
    ]);
  });

  it("should remove an export prefix, surrounding quotes and inline comments", () => {
    const vars = parseEnv(
      [
        "export A=1",
        'B="2"',
        "C='3'",
        "D=4 # comment",
        'E="5 # not a comment" # comment',
        String.raw`F="a\"b"`,
        String.raw`G='a\'`,
        "H=",
      ].join("\n"),
    );
    expect([...vars]).toEqual([
      ["A", "1"],
      ["B", "2"],
      ["C", "3"],
      ["D", "4"],
      ["E", "5 # not a comment"],
      ["F", String.raw`a\"b`],
      ["G", "a\\"],
      ["H", ""],
    ]);
  });

  it("should read a quoted value over many lines", () => {
    const vars = parseEnv(
      ["A=1", 'KEY="-----BEGIN-----', "  YWJj==", '-----END-----"', "B=2"].join("\r\n"),
    );
    expect([...vars]).toEqual([
      ["A", "1"],
      ["KEY", "-----BEGIN-----\n  YWJj==\n-----END-----"],
      ["B", "2"],
    ]);
  });

  it("should read an unclosed quoted value to the end of the file", () => {
    expect([...parseEnv("A='1\nB=2")]).toEqual([["A", "1\nB=2"]]);
  });
});

describe("diffEnv", () => {
  it("should list added, removed and changed names", () => {
    const remote = "A=1\nB=2\nC=3";
    const local = "A=1\nB=changed\nD=4";
    expect(diffEnv(remote, local)).toEqual({ added: ["D"], removed: ["C"], changed: ["B"] });
  });

  it("should treat values that are equal in dotenv syntax as the same", () => {
    expect(diffEnv('export A=1\nB="2"\nC=3 # note', "A=1\nB=2\nC='3'")).toEqual({
      added: [],
      removed: [],
      changed: [],
    });
  });

  it("should ignore comments, blank lines and order", () => {
    expect(diffEnv("A=1\nB=2", "# local\n\nB=2\nA=1\n")).toEqual({
      added: [],
      removed: [],
      changed: [],
    });
  });
});

describe("compareText", () => {
  it("should report in sync for equal content", () => {
    expect(compareText("a\r\n", "a")).toEqual({ inSync: true });
  });

  it("should return the unified diff when the content differs", () => {
    expect(compareText("a", "b")).toEqual({
      inSync: false,
      diff: "--- remote\n+++ local\n@@ -1,1 +1,1 @@\n-a\n+b",
    });
  });
});

describe("compareEnv", () => {
  it("should report in sync when the variables are the same", () => {
    expect(compareEnv("A=1", "# comment\nA=1\n")).toEqual({ inSync: true });
  });

  it("should report names only, never values", () => {
    const result = compareEnv(
      "KEEP=x\nOLD=old-secret\nPASS=remote-secret",
      "KEEP=x\nPASS=local-secret\nNEW=new-secret",
    );
    expect(result).toEqual({
      inSync: false,
      diff: { added: ["NEW"], removed: ["OLD"], changed: ["PASS"] },
    });
    expect(JSON.stringify(result)).not.toMatch(/secret/);
  });

  it("should report a changed multi-line value by name and never show a part of it", () => {
    const key = (last: string) =>
      [
        'KEY="-----BEGIN PRIVATE KEY-----',
        "c2VjcmV0c2VjcmV0==",
        last,
        '-----END PRIVATE KEY-----"',
      ].join("\n");
    const result = compareEnv(`A=1\n${key("QUJDREVG==")}`, `A=1\n${key("R0hJSktM==")}`);
    expect(result).toEqual({
      inSync: false,
      diff: { added: [], removed: [], changed: ["KEY"] },
    });
    expect(JSON.stringify(result)).not.toMatch(/c2Vj|QUJD|R0hJ|BEGIN/);
  });
});

describe("formatEnvDiff", () => {
  it("should print one line per name with its change", () => {
    expect(formatEnvDiff({ added: ["NEW"], removed: ["OLD"], changed: ["PASS"] })).toBe(
      "+ NEW (added)\n- OLD (removed)\n~ PASS (changed)",
    );
  });

  it("should return an empty string for no change", () => {
    expect(formatEnvDiff({ added: [], removed: [], changed: [] })).toBe("");
  });
});
