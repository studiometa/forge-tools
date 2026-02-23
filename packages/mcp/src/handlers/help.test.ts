import { describe, expect, it } from "vitest";

import { handleHelp, handleHelpOverview } from "./help.ts";

describe("handleHelp", () => {
  it("should return help for servers", () => {
    const result = handleHelp("servers");
    const data = JSON.parse(result.content[0]!.text);
    expect(data.resource).toBe("servers");
    expect(data.actions).toHaveProperty("list");
    expect(data.actions).toHaveProperty("reboot");
    expect(data.scope).toContain("global");
  });

  it("should return help for sites", () => {
    const result = handleHelp("sites");
    const data = JSON.parse(result.content[0]!.text);
    expect(data.resource).toBe("sites");
    expect(data.scope).toContain("server");
  });

  it("should return help for deployments", () => {
    const result = handleHelp("deployments");
    const data = JSON.parse(result.content[0]!.text);
    expect(data.resource).toBe("deployments");
    expect(data.actions).toHaveProperty("deploy");
  });

  it("should return overview for unknown resource", () => {
    const result = handleHelp("unknown");
    const data = JSON.parse(result.content[0]!.text);
    expect(data.resources).toBeDefined();
    expect(data.resources.length).toBeGreaterThan(0);
  });

  it("should return help for all Phase 2/3 resources", () => {
    const resources = [
      "certificates",
      "databases",
      "daemons",
      "firewall-rules",
      "ssh-keys",
      "security-rules",
      "redirect-rules",
      "monitors",
      "nginx-templates",
      "recipes",
      "env",
      "nginx",
    ];
    for (const resource of resources) {
      const result = handleHelp(resource);
      const data = JSON.parse(result.content[0]!.text);
      expect(data.resource).toBe(resource);
      expect(data.actions).toBeDefined();
    }
  });
});

describe("handleHelpOverview", () => {
  it("should return a global overview", () => {
    const result = handleHelpOverview();
    const data = JSON.parse(result.content[0]!.text);
    expect(data.resources).toBeDefined();
    const resourceNames = data.resources.map((r: { resource: string }) => r.resource);
    expect(resourceNames).toContain("servers");
    expect(resourceNames).toContain("sites");
    expect(resourceNames).toContain("deployments");
    expect(resourceNames).toContain("recipes");
  });
});
