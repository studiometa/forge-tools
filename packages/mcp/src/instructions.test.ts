import { describe, expect, it, vi } from "vitest";

vi.mock("node:fs", () => ({
  readFileSync: () => {
    throw new Error("ENOENT");
  },
}));

describe("loadInstructions", () => {
  it("should return fallback string when SKILL.md cannot be read", async () => {
    const { INSTRUCTIONS } = await import("./instructions.ts");
    expect(INSTRUCTIONS).toContain("Laravel Forge MCP Server");
  });
});
