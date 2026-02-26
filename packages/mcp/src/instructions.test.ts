import { describe, expect, it, vi } from "vitest";

describe("loadInstructions", () => {
  it("should return fallback string when SKILL.md cannot be read", async () => {
    vi.mock("node:fs", () => ({
      readFileSync: () => {
        throw new Error("ENOENT");
      },
    }));

    const { INSTRUCTIONS } = await import("./instructions.ts");
    expect(INSTRUCTIONS).toContain("Laravel Forge MCP Server");
  });
});
