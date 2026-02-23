import { describe, expect, it } from "vitest";

import { handleSchema, handleSchemaOverview } from "./schema.ts";

describe("handleSchema", () => {
  it("should return schema for servers", () => {
    const result = handleSchema("servers");
    const data = JSON.parse(result.content[0]!.text);
    expect(data.resource).toBe("servers");
    expect(data.actions).toContain("list");
    expect(data.actions).toContain("reboot");
    expect(data.scope).toBe("global");
  });

  it("should return schema for sites with required fields", () => {
    const result = handleSchema("sites");
    const data = JSON.parse(result.content[0]!.text);
    expect(data.resource).toBe("sites");
    expect(data.required.list).toContain("server_id");
    expect(data.create).toBeDefined();
  });

  it("should return error for unknown resource", () => {
    const result = handleSchema("unknown");
    const data = JSON.parse(result.content[0]!.text);
    expect(data.error).toContain("Unknown resource");
  });

  it("should return schema for all resources", () => {
    const resources = [
      "servers",
      "sites",
      "deployments",
      "env",
      "nginx",
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
    ];
    for (const resource of resources) {
      const result = handleSchema(resource);
      const data = JSON.parse(result.content[0]!.text);
      expect(data.resource).toBe(resource);
      expect(data.actions).toBeDefined();
      expect(data.scope).toBeDefined();
    }
  });
});

describe("handleSchemaOverview", () => {
  it("should return overview of all resources", () => {
    const result = handleSchemaOverview();
    const data = JSON.parse(result.content[0]!.text);
    expect(data.resources.length).toBeGreaterThan(10);
    expect(data._tip).toContain("schema");
  });
});
