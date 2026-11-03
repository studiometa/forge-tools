import { describe, it, expect } from "vitest";

import { envDrift } from "./env-diff.ts";

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
