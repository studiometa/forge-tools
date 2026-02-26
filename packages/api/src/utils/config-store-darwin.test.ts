/**
 * Tests for macOS config path resolution.
 */
import { describe, expect, it, vi } from "vitest";

vi.mock("node:os", () => ({
  homedir: () => "/Users/test",
  platform: () => "darwin",
}));

import { ConfigStore } from "./config-store.ts";

describe("ConfigStore — darwin paths", () => {
  it("should use Library/Application Support on macOS", () => {
    const store = new ConfigStore("forge-tools");
    expect(store.getPath()).toContain("Library/Application Support");
    expect(store.getPath()).toContain("forge-tools");
    expect(store.getPath()).toContain("config.json");
  });
});
