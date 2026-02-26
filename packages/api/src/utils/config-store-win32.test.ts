/**
 * Tests for Windows config path resolution.
 */
import { describe, expect, it, vi } from "vitest";

vi.mock("node:os", () => ({
  homedir: () => "C:\\Users\\test",
  platform: () => "win32",
}));

import { ConfigStore } from "./config-store.ts";

describe("ConfigStore — win32 paths", () => {
  it("should use APPDATA on Windows when APPDATA is set", () => {
    const originalAppData = process.env.APPDATA;
    process.env.APPDATA = "C:\\Users\\test\\AppData\\Roaming";
    const store = new ConfigStore("forge-tools");
    process.env.APPDATA = originalAppData;
    expect(store.getPath()).toContain("AppData");
    expect(store.getPath()).toContain("forge-tools");
  });

  it("should fall back to homedir AppData on Windows when APPDATA is not set", () => {
    const originalAppData = process.env.APPDATA;
    delete process.env.APPDATA;
    const store = new ConfigStore("forge-tools");
    process.env.APPDATA = originalAppData;
    expect(store.getPath()).toMatch(/AppData|Users/);
    expect(store.getPath()).toContain("forge-tools");
  });
});
