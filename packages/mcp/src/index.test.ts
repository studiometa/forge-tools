import { describe, it, expect } from "vitest";

describe("forge-mcp", () => {
  it("should be importable", async () => {
    const mod = await import("./index.ts");
    expect(mod).toBeDefined();
  });
});
