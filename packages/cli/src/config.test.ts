import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@studiometa/forge-api", () => ({
  createConfigStore: vi.fn().mockReturnValue({}),
  getToken: vi.fn().mockReturnValue(null),
  setToken: vi.fn(),
  deleteToken: vi.fn(),
}));

describe("getConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.FORGE_API_TOKEN;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("should return token from CLI argument", async () => {
    const { getConfig } = await import("./config.ts");
    const config = getConfig({ token: "cli-token" });
    expect(config.apiToken).toBe("cli-token");
  });

  it("should return token from stored config when no CLI arg", async () => {
    const { getToken } = await import("@studiometa/forge-api");
    vi.mocked(getToken).mockReturnValue("stored-token");
    const { getConfig } = await import("./config.ts");
    const config = getConfig({});
    expect(config.apiToken).toBe("stored-token");
  });

  it("should return undefined when no token available", async () => {
    const { getToken } = await import("@studiometa/forge-api");
    vi.mocked(getToken).mockReturnValue(null);
    const { getConfig } = await import("./config.ts");
    const config = getConfig({});
    expect(config.apiToken).toBeUndefined();
  });

  it("should prefer CLI arg over stored token", async () => {
    const { getToken } = await import("@studiometa/forge-api");
    vi.mocked(getToken).mockReturnValue("stored-token");
    const { getConfig } = await import("./config.ts");
    const config = getConfig({ token: "cli-token" });
    expect(config.apiToken).toBe("cli-token");
  });

  it("should ignore non-string token CLI arg", async () => {
    const { getToken } = await import("@studiometa/forge-api");
    vi.mocked(getToken).mockReturnValue("stored-token");
    const { getConfig } = await import("./config.ts");
    const config = getConfig({ token: true });
    expect(config.apiToken).toBe("stored-token");
  });
});
