import { describe, expect, it, vi } from "vitest";

vi.mock("node:os", () => ({
  homedir: () => "/home/test",
  platform: () => "linux",
}));

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

    it("should use XDG_CONFIG_HOME when set", () => {
      const original = process.env.XDG_CONFIG_HOME;
      try {
        process.env.XDG_CONFIG_HOME = "/custom/xdg";
        const fs = createMockFs();
        // Create store AFTER setting env var so configPath is resolved with new value
        const store = new ConfigStore("forge-tools", fs);
        expect(store.getPath()).toContain("/custom/xdg");
      } finally {
        if (original === undefined) {
          delete process.env.XDG_CONFIG_HOME;
        } else {
          process.env.XDG_CONFIG_HOME = original;
        }
      }
    });
  });

  describe("set — dir already exists", () => {
    it("should skip mkdir when directory already exists", () => {
      const configPath = configStore_getPath("forge-tools");
      const dir = configPath.substring(0, configPath.lastIndexOf("/"));
      // Pre-populate the directory entry so existsSync(dir) returns true
      const files: Record<string, string> = { [dir]: "dir-marker" };
      const mockFs = createMockFs(files);
      const store = new ConfigStore<{ apiToken: string }>("forge-tools", mockFs);

      store.set({ apiToken: "tok" });
      expect(mockFs.mkdirSync).not.toHaveBeenCalled();
    });
  });
});

/**
 * Helper to get the expected config path.
 * Since we mock platform() to return "linux" and homedir() to return "/home/test",
 * this uses XDG_CONFIG_HOME if set, otherwise ~/.config.
 */
function configStore_getPath(appName: string): string {
  const xdg = process.env.XDG_CONFIG_HOME;
  const base = xdg ?? "/home/test/.config";
  return `${base}/${appName}/config.json`;
}
