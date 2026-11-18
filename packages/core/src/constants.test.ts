import { describe, expect, it } from "vitest";

import { ACTIONS, RESOURCES } from "./constants.ts";

describe("constants", () => {
  it("should export RESOURCES array with all 28 implemented resources", () => {
    expect(RESOURCES).toHaveLength(28);
    expect(RESOURCES).toContain("events");
    expect(RESOURCES).toContain("network");
    expect(RESOURCES).toContain("deploy-key");
    expect(RESOURCES).toContain("git");
    expect(RESOURCES).toContain("servers");
    expect(RESOURCES).toContain("sites");
    expect(RESOURCES).toContain("deployments");
    expect(RESOURCES).toContain("databases");
    expect(RESOURCES).toContain("database-users");
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
    expect(RESOURCES).toContain("backups");
    expect(RESOURCES).toContain("storage-providers");
    expect(RESOURCES).toContain("commands");
    expect(RESOURCES).toContain("scheduled-jobs");
    expect(RESOURCES).toContain("services");
    expect(RESOURCES).toContain("php");
    expect(RESOURCES).toContain("user");
    expect(RESOURCES).toContain("batch");
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
    expect(ACTIONS).toContain("deactivate");
    expect(ACTIONS).toContain("export");
    expect(ACTIONS).toContain("import");
    expect(ACTIONS).toContain("reorder");
  });
});
