import { describe, expect, it } from "vitest";

import { STDIO_ONLY_TOOLS, TOOLS } from "./tools.ts";

describe("TOOLS", () => {
  it("should export a single forge tool", () => {
    expect(TOOLS).toHaveLength(1);
    expect(TOOLS[0]!.name).toBe("forge");
  });

  it("should have required input schema properties", () => {
    const schema = TOOLS[0]!.inputSchema as {
      required: string[];
      properties: Record<string, unknown>;
    };
    expect(schema.required).toContain("resource");
    expect(schema.required).toContain("action");
    expect(schema.properties).toHaveProperty("resource");
    expect(schema.properties).toHaveProperty("action");
    expect(schema.properties).toHaveProperty("server_id");
    expect(schema.properties).toHaveProperty("site_id");
  });

  it("should include description with resources", () => {
    expect(TOOLS[0]!.description).toContain("servers");
    expect(TOOLS[0]!.description).toContain("sites");
    expect(TOOLS[0]!.description).toContain("deployments");
  });
});

describe("STDIO_ONLY_TOOLS", () => {
  it("should export configure and get_config tools", () => {
    expect(STDIO_ONLY_TOOLS).toHaveLength(2);
    const names = STDIO_ONLY_TOOLS.map((t) => t.name);
    expect(names).toContain("forge_configure");
    expect(names).toContain("forge_get_config");
  });
});
