import { describe, expect, it } from "vitest";

import {
  READ_ACTIONS,
  WRITE_ACTIONS,
  STDIO_ONLY_TOOLS,
  TOOLS,
  isReadAction,
  isWriteAction,
  getTools,
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

    it("should have a top-level title", () => {
      expect(forgeTool.title).toBe("Laravel Forge");
    });

    it("should be annotated as read-only", () => {
      expect(forgeTool.annotations?.readOnlyHint).toBe(true);
      expect(forgeTool.annotations?.destructiveHint).toBe(false);
    });

    it("should have an outputSchema with success field", () => {
      expect(forgeTool.outputSchema).toBeDefined();
      expect(forgeTool.outputSchema!.type).toBe("object");
      expect(forgeTool.outputSchema!.required).toContain("success");
      expect(forgeTool.outputSchema!.properties).toHaveProperty("success");
      expect(forgeTool.outputSchema!.properties).toHaveProperty("result");
      expect(forgeTool.outputSchema!.properties).toHaveProperty("error");
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

    it("should have a top-level title", () => {
      expect(writeToolDef.title).toBe("Laravel Forge (Write)");
    });

    it("should be annotated as destructive", () => {
      expect(writeToolDef.annotations?.readOnlyHint).toBe(false);
      expect(writeToolDef.annotations?.destructiveHint).toBe(true);
    });

    it("should have an outputSchema with success field", () => {
      expect(writeToolDef.outputSchema).toBeDefined();
      expect(writeToolDef.outputSchema!.type).toBe("object");
      expect(writeToolDef.outputSchema!.required).toContain("success");
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

describe("getTools", () => {
  it("should return both tools when no options provided", () => {
    const tools = getTools();
    const names = tools.map((t) => t.name);
    expect(names).toContain("forge");
    expect(names).toContain("forge_write");
    expect(tools).toHaveLength(2);
  });

  it("should return both tools when readOnly is false", () => {
    const tools = getTools({ readOnly: false });
    const names = tools.map((t) => t.name);
    expect(names).toContain("forge");
    expect(names).toContain("forge_write");
  });

  it("should exclude forge_write when readOnly is true", () => {
    const tools = getTools({ readOnly: true });
    const names = tools.map((t) => t.name);
    expect(names).toContain("forge");
    expect(names).not.toContain("forge_write");
    expect(tools).toHaveLength(1);
  });

  it("should return a copy, not the original array", () => {
    const tools1 = getTools();
    const tools2 = getTools();
    expect(tools1).not.toBe(tools2);
    expect(tools1).not.toBe(TOOLS);
  });
});

describe("STDIO_ONLY_TOOLS", () => {
  it("should export configure and get_config tools", () => {
    expect(STDIO_ONLY_TOOLS).toHaveLength(2);
    const names = STDIO_ONLY_TOOLS.map((t) => t.name);
    expect(names).toContain("forge_configure");
    expect(names).toContain("forge_get_config");
  });

  it("should have top-level titles on all stdio tools", () => {
    for (const tool of STDIO_ONLY_TOOLS) {
      expect(tool.title).toBeDefined();
      expect(tool.title!.length).toBeGreaterThan(0);
    }
  });

  it("should have outputSchema on all stdio tools", () => {
    for (const tool of STDIO_ONLY_TOOLS) {
      expect(tool.outputSchema).toBeDefined();
      expect(tool.outputSchema!.type).toBe("object");
    }
  });

  it("forge_configure outputSchema should have success and message fields", () => {
    const tool = STDIO_ONLY_TOOLS.find((t) => t.name === "forge_configure")!;
    expect(tool.outputSchema!.properties).toHaveProperty("success");
    expect(tool.outputSchema!.properties).toHaveProperty("message");
    expect(tool.outputSchema!.properties).toHaveProperty("apiToken");
  });

  it("forge_get_config outputSchema should have configured and apiToken fields", () => {
    const tool = STDIO_ONLY_TOOLS.find((t) => t.name === "forge_get_config")!;
    expect(tool.outputSchema!.properties).toHaveProperty("configured");
    expect(tool.outputSchema!.properties).toHaveProperty("apiToken");
  });
});
