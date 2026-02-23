import { describe, expect, it } from "vitest";

import { ACTIONS, RESOURCES } from "./constants.ts";

describe("constants", () => {
  it("should export RESOURCES array", () => {
    expect(RESOURCES).toContain("servers");
    expect(RESOURCES).toContain("sites");
    expect(RESOURCES).toContain("deployments");
    expect(RESOURCES).toContain("databases");
    expect(RESOURCES).toContain("daemons");
    expect(RESOURCES).toContain("certificates");
    expect(RESOURCES).toContain("env");
    expect(RESOURCES).toContain("nginx");
  });

  it("should export ACTIONS array", () => {
    expect(ACTIONS).toContain("list");
    expect(ACTIONS).toContain("get");
    expect(ACTIONS).toContain("create");
    expect(ACTIONS).toContain("update");
    expect(ACTIONS).toContain("delete");
    expect(ACTIONS).toContain("deploy");
    expect(ACTIONS).toContain("reboot");
    expect(ACTIONS).toContain("help");
  });
});
