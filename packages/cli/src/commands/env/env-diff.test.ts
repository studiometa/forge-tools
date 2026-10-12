import { describe, it, expect } from "vitest";

import { diffEnv, envDrift, parseEnv } from "./env-diff.ts";

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

describe("envDrift", () => {
  it("should return null when the variables are the same", () => {
    expect(envDrift("A=1", "A=1\n")).toBeNull();
  });

  it("should report names only, never values", () => {
    const drift = envDrift(
      "KEEP=x\nOLD=old-secret\nPASS=remote-secret",
      "KEEP=x\nPASS=local-secret\nNEW=new-secret",
    );
    expect(drift).toEqual({
      text: "+ NEW (added)\n- OLD (removed)\n~ PASS (changed)",
      json: { added: ["NEW"], removed: ["OLD"], changed: ["PASS"] },
    });
    expect(JSON.stringify(drift)).not.toMatch(/secret/);
  });

  it("should report a changed multi-line value by name and never show a part of it", () => {
    const key = (last: string) =>
      [
        'KEY="-----BEGIN PRIVATE KEY-----',
        "c2VjcmV0c2VjcmV0==",
        last,
        '-----END PRIVATE KEY-----"',
      ].join("\n");
    const drift = envDrift(`A=1\n${key("QUJDREVG==")}`, `A=1\n${key("R0hJSktM==")}`);
    expect(drift).toEqual({
      text: "~ KEY (changed)",
      json: { added: [], removed: [], changed: ["KEY"] },
    });
    expect(JSON.stringify(drift)).not.toMatch(/c2Vj|QUJD|R0hJ|BEGIN/);
  });
});
