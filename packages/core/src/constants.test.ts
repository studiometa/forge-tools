import { describe, expect, it } from "vitest";

import { ACTIONS, RESOURCES } from "./constants.ts";

describe("constants", () => {
  it("should export RESOURCES array with all 15 implemented resources", () => {
    expect(RESOURCES).toHaveLength(15);
    expect(RESOURCES).toContain("servers");
    expect(RESOURCES).toContain("sites");
    expect(RESOURCES).toContain("deployments");
    expect(RESOURCES).toContain("databases");
    expect(RESOURCES).toContain("daemons");
    expect(RESOURCES).toContain("certificates");
    expect(RESOURCES).toContain("env");
    expect(RESOURCES).toContain("nginx");
    expect(RESOURCES).toContain("firewall-rules");
    expect(RESOURCES).toContain("ssh-keys");
    expect(RESOURCES).toContain("security-rules");
    expect(RESOURCES).toContain("redirect-rules");
    expect(RESOURCES).toContain("nginx-templates");
    expect(RESOURCES).toContain("monitors");
    expect(RESOURCES).toContain("recipes");
  });

  it("should NOT include unimplemented resources", () => {
    expect(RESOURCES).not.toContain("backups");
    expect(RESOURCES).not.toContain("commands");
    expect(RESOURCES).not.toContain("scheduled-jobs");
    expect(RESOURCES).not.toContain("logs");
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
