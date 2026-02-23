import { describe, expect, it, vi } from "vitest";

import type { ConfigStoreFs } from "./config-store.ts";

import { ConfigStore } from "./config-store.ts";

function createMockFs(files: Record<string, string> = {}): ConfigStoreFs {
  const store = new Map(Object.entries(files));

  return {
    existsSync: (path: string) => store.has(path),
    mkdirSync: vi.fn(),
    readFileSync: (path: string) => {
      const content = store.get(path);
      if (!content) throw new Error(`ENOENT: ${path}`);
      return content;
    },
    writeFileSync: (_path: string, data: string) => {
      store.set(_path, data);
    },
    unlinkSync: (path: string) => {
      store.delete(path);
    },
  };
}

describe("ConfigStore", () => {
  describe("get", () => {
    it("should return null when no config file exists", () => {
      const fs = createMockFs();
      const store = new ConfigStore("forge-tools", fs);

      expect(store.get()).toBeNull();
    });

    it("should return parsed config from file", () => {
      const config = { apiToken: "test-token" };
      const fs = createMockFs();
      const configStore = new ConfigStore<typeof config>("forge-tools", fs);

      // Write first
      configStore.set(config);

      // Read back
      expect(configStore.get()).toEqual(config);
    });

    it("should return null on invalid JSON", () => {
      const path = configStore_getPath("forge-tools");
      const fs = createMockFs({ [path]: "not-json" });
      const store = new ConfigStore("forge-tools", fs);

      expect(store.get()).toBeNull();
    });
  });

  describe("getField", () => {
    it("should return a specific field", () => {
      const fs = createMockFs();
      const store = new ConfigStore<{ apiToken: string }>("forge-tools", fs);

      store.set({ apiToken: "my-token" });
      expect(store.getField("apiToken")).toBe("my-token");
    });

    it("should return undefined for missing field", () => {
      const fs = createMockFs();
      const store = new ConfigStore<{ apiToken: string }>("forge-tools", fs);

      expect(store.getField("apiToken")).toBeUndefined();
    });
  });

  describe("set", () => {
    it("should create directory and write config", () => {
      const fs = createMockFs();
      const store = new ConfigStore<{ apiToken: string }>("forge-tools", fs);

      store.set({ apiToken: "new-token" });

      expect(fs.mkdirSync).toHaveBeenCalled();
      expect(store.get()).toEqual({ apiToken: "new-token" });
    });
  });

  describe("update", () => {
    it("should merge with existing config", () => {
      const fs = createMockFs();
      const store = new ConfigStore<{ apiToken: string; extra?: string }>("forge-tools", fs);

      store.set({ apiToken: "original" });
      store.update({ extra: "value" });

      expect(store.get()).toEqual({ apiToken: "original", extra: "value" });
    });

    it("should create config if none exists", () => {
      const fs = createMockFs();
      const store = new ConfigStore<{ apiToken: string }>("forge-tools", fs);

      store.update({ apiToken: "new" });
      expect(store.get()).toEqual({ apiToken: "new" });
    });
  });

  describe("delete", () => {
    it("should remove config file", () => {
      const fs = createMockFs();
      const store = new ConfigStore<{ apiToken: string }>("forge-tools", fs);

      store.set({ apiToken: "to-delete" });
      expect(store.get()).not.toBeNull();

      store.delete();
      expect(store.get()).toBeNull();
    });

    it("should be no-op when no config file exists", () => {
      const fs = createMockFs();
      const store = new ConfigStore("forge-tools", fs);

      // Should not throw
      store.delete();
    });
  });

  describe("getPath", () => {
    it("should return a path containing the app name", () => {
      const fs = createMockFs();
      const store = new ConfigStore("forge-tools", fs);

      expect(store.getPath()).toContain("forge-tools");
      expect(store.getPath()).toContain("config.json");
    });
  });
});

/**
 * Helper to get the expected config path (Linux only — tests run on Linux).
 */
function configStore_getPath(appName: string): string {
  const xdg = process.env.XDG_CONFIG_HOME;
  const home = process.env.HOME ?? "/home/test";
  const base = xdg ?? `${home}/.config`;
  return `${base}/${appName}/config.json`;
}
