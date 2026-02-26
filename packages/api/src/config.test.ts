import { afterEach, describe, expect, it, vi } from "vitest";

import type { ForgeConfig } from "./types.ts";

import { createConfigStore, deleteToken, getToken, setToken } from "./config.ts";
import { ConfigStore } from "./utils/config-store.ts";

function createMockStore(config: ForgeConfig | null = null) {
  const data = { current: config };
  return {
    get: vi.fn(() => data.current),
    getField: vi.fn((key: keyof ForgeConfig) => data.current?.[key]),
    set: vi.fn((c: ForgeConfig) => {
      data.current = c;
    }),
    update: vi.fn((partial: Partial<ForgeConfig>) => {
      data.current = { ...data.current, ...partial } as ForgeConfig;
    }),
    delete: vi.fn(() => {
      data.current = null;
    }),
    getPath: vi.fn(() => "/mock/path/config.json"),
  } as unknown as ConfigStore<ForgeConfig>;
}

describe("getToken", () => {
  afterEach(() => {
    delete process.env.FORGE_API_TOKEN;
  });

  it("should return env var when set", () => {
    process.env.FORGE_API_TOKEN = "env-token";
    expect(getToken()).toBe("env-token");
  });

  it("should return config file token when no env var", () => {
    const store = createMockStore({ apiToken: "file-token" });
    expect(getToken(store)).toBe("file-token");
  });

  it("should prefer env var over config file", () => {
    process.env.FORGE_API_TOKEN = "env-token";
    const store = createMockStore({ apiToken: "file-token" });
    expect(getToken(store)).toBe("env-token");
  });

  it("should return null when nothing is configured", () => {
    const store = createMockStore();
    expect(getToken(store)).toBeNull();
  });
});

describe("setToken", () => {
  it("should save token to config store", () => {
    const store = createMockStore();
    setToken("new-token", store);
    expect(store.update).toHaveBeenCalledWith({ apiToken: "new-token" });
  });
});

describe("deleteToken", () => {
  it("should delete config store", () => {
    const store = createMockStore({ apiToken: "to-delete" });
    deleteToken(store);
    expect(store.delete).toHaveBeenCalled();
  });
});

describe("createConfigStore", () => {
  it("should return a ConfigStore instance when called without args", () => {
    // createConfigStore() uses the real node:fs but we can just check the return type
    const store = createConfigStore();
    expect(store).toBeInstanceOf(ConfigStore);
  });
});
