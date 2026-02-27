import { describe, expect, it, beforeEach, afterEach } from "vitest";

describe("parseReadOnlyFlag", () => {
  const originalArgv = process.argv;

  beforeEach(() => {
    delete process.env.FORGE_READ_ONLY;
    process.argv = [...originalArgv];
  });

  afterEach(() => {
    delete process.env.FORGE_READ_ONLY;
    process.argv = originalArgv;
  });

  it("should return false with no flags", async () => {
    const { parseReadOnlyFlag } = await import("./flags.ts");
    expect(parseReadOnlyFlag()).toBe(false);
  });

  it("should return true when --read-only argv is present", async () => {
    process.argv = [...originalArgv, "--read-only"];
    const { parseReadOnlyFlag } = await import("./flags.ts");
    expect(parseReadOnlyFlag()).toBe(true);
  });

  it("should return true when FORGE_READ_ONLY=true", async () => {
    process.env.FORGE_READ_ONLY = "true";
    const { parseReadOnlyFlag } = await import("./flags.ts");
    expect(parseReadOnlyFlag()).toBe(true);
  });
});
