import { describe, expect, it } from "vitest";

import {
  READ_ACTIONS,
  WRITE_ACTIONS,
  STDIO_ONLY_TOOLS,
  TOOLS,
  isReadAction,
  isWriteAction,
} from "./tools.ts";

describe("TOOLS", () => {
  it("should export forge (read) and forge_write (write) tools", () => {
    expect(TOOLS).toHaveLength(2);
    const names = TOOLS.map((t) => t.name);
    expect(names).toContain("forge");
    expect(names).toContain("forge_write");
  });

  describe("forge (read tool)", () => {
    const forgeTool = TOOLS.find((t) => t.name === "forge")!;

    it("should be annotated as read-only", () => {
      expect(forgeTool.annotations?.readOnlyHint).toBe(true);
      expect(forgeTool.annotations?.destructiveHint).toBe(false);
    });

    it("should only allow read actions", () => {
      const schema = forgeTool.inputSchema as {
        properties: { action: { enum: string[] } };
      };
      expect(schema.properties.action.enum).toEqual([...READ_ACTIONS]);
    });

    it("should have required input schema properties", () => {
      const schema = forgeTool.inputSchema as {
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
      expect(forgeTool.description).toContain("servers");
      expect(forgeTool.description).toContain("sites");
      expect(forgeTool.description).toContain("read");
    });

    it("should not include write-only fields like command or script", () => {
      const schema = forgeTool.inputSchema as {
        properties: Record<string, unknown>;
      };
      expect(schema.properties).not.toHaveProperty("command");
      expect(schema.properties).not.toHaveProperty("script");
      expect(schema.properties).not.toHaveProperty("key");
    });
  });

  describe("forge_write (write tool)", () => {
    const writeToolDef = TOOLS.find((t) => t.name === "forge_write")!;

    it("should be annotated as destructive", () => {
      expect(writeToolDef.annotations?.readOnlyHint).toBe(false);
      expect(writeToolDef.annotations?.destructiveHint).toBe(true);
    });

    it("should only allow write actions", () => {
      const schema = writeToolDef.inputSchema as {
        properties: { action: { enum: string[] } };
      };
      expect(schema.properties.action.enum).toEqual([...WRITE_ACTIONS]);
    });

    it("should have required input schema properties", () => {
      const schema = writeToolDef.inputSchema as {
        required: string[];
        properties: Record<string, unknown>;
      };
      expect(schema.required).toContain("resource");
      expect(schema.required).toContain("action");
    });

    it("should include write-specific fields", () => {
      const schema = writeToolDef.inputSchema as {
        properties: Record<string, unknown>;
      };
      expect(schema.properties).toHaveProperty("command");
      expect(schema.properties).toHaveProperty("script");
      expect(schema.properties).toHaveProperty("content");
      expect(schema.properties).toHaveProperty("key");
    });
  });
});

describe("READ_ACTIONS", () => {
  it("should contain list, get, help, schema", () => {
    expect([...READ_ACTIONS]).toEqual(["list", "get", "help", "schema"]);
  });
});

describe("WRITE_ACTIONS", () => {
  it("should contain create, update, delete, deploy, reboot, restart, activate, run", () => {
    expect([...WRITE_ACTIONS]).toEqual([
      "create",
      "update",
      "delete",
      "deploy",
      "reboot",
      "restart",
      "activate",
      "run",
    ]);
  });
});

describe("isWriteAction", () => {
  it("should return true for write actions", () => {
    expect(isWriteAction("create")).toBe(true);
    expect(isWriteAction("delete")).toBe(true);
    expect(isWriteAction("deploy")).toBe(true);
    expect(isWriteAction("reboot")).toBe(true);
  });

  it("should return false for read actions", () => {
    expect(isWriteAction("list")).toBe(false);
    expect(isWriteAction("get")).toBe(false);
    expect(isWriteAction("help")).toBe(false);
  });

  it("should return false for unknown actions", () => {
    expect(isWriteAction("unknown")).toBe(false);
  });
});

describe("isReadAction", () => {
  it("should return true for read actions", () => {
    expect(isReadAction("list")).toBe(true);
    expect(isReadAction("get")).toBe(true);
    expect(isReadAction("help")).toBe(true);
    expect(isReadAction("schema")).toBe(true);
  });

  it("should return false for write actions", () => {
    expect(isReadAction("create")).toBe(false);
    expect(isReadAction("delete")).toBe(false);
  });

  it("should return false for unknown actions", () => {
    expect(isReadAction("unknown")).toBe(false);
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
