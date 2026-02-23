import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { deleteToken } from "@studiometa/forge-api";

import { getAvailableTools, handleConfigureTool, handleGetConfigTool } from "./stdio.ts";

describe("getAvailableTools", () => {
  it("should include forge tool and stdio-only tools", () => {
    const tools = getAvailableTools();
    const names = tools.map((t: { name: string }) => t.name);
    expect(names).toContain("forge");
    expect(names).toContain("forge_configure");
    expect(names).toContain("forge_get_config");
  });
});

describe("handleConfigureTool", () => {
  afterEach(() => {
    delete process.env.FORGE_API_TOKEN;
  });

  it("should return success with masked token", () => {
    const result = handleConfigureTool({ apiToken: "test-token-1234" });
    expect(result.isError).toBeUndefined();
    const text = result.content[0]!.text;
    expect(text).toContain("success");
    expect(text).toContain("***1234");
    expect(text).not.toContain("test-token-1234");
  });

  it("should reject empty token", () => {
    const result = handleConfigureTool({ apiToken: "" });
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("required");
  });

  it("should reject whitespace-only token", () => {
    const result = handleConfigureTool({ apiToken: "   " });
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("required");
  });
});

describe("handleGetConfigTool", () => {
  beforeEach(() => {
    delete process.env.FORGE_API_TOKEN;
    deleteToken();
  });

  afterEach(() => {
    delete process.env.FORGE_API_TOKEN;
    deleteToken();
  });

  it("should show not configured when no token", () => {
    const result = handleGetConfigTool();
    const text = result.content[0]!.text;
    expect(text).toContain("not configured");
  });

  it("should show masked token when env var is set", () => {
    process.env.FORGE_API_TOKEN = "env-token-5678";
    const result = handleGetConfigTool();
    const text = result.content[0]!.text;
    expect(text).toContain("***5678");
    expect(text).toContain("configured");
  });
});
