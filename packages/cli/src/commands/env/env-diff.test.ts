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
});

describe("diffEnv", () => {
  it("should list added, removed and changed names", () => {
    const remote = "A=1\nB=2\nC=3";
    const local = "A=1\nB=changed\nD=4";
    expect(diffEnv(remote, local)).toEqual({ added: ["D"], removed: ["C"], changed: ["B"] });
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
});
