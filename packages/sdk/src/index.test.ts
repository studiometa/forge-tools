import { describe, it, expect } from "vitest";

describe("forge-sdk", () => {
  it("should be importable", async () => {
    const mod = await import("./index.ts");
    expect(mod).toBeDefined();
  });
});
