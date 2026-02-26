/**
 * Tests for config.ts functions called without explicit configStore argument.
 * Covers the createConfigStore() fallback branches.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:os", () => ({
  homedir: () => "/home/test",
  platform: () => "linux",
}));

vi.mock("node:fs", () => ({
  existsSync: vi.fn(() => false),
  mkdirSync: vi.fn(),
  readFileSync: vi.fn(() => {
    throw new Error("ENOENT");
  }),
  writeFileSync: vi.fn(),
  unlinkSync: vi.fn(),
}));

import { deleteToken, getToken, setToken } from "./config.ts";

describe("config — default configStore fallback", () => {
  beforeEach(() => {
    delete process.env.FORGE_API_TOKEN;
  });

  afterEach(() => {
    delete process.env.FORGE_API_TOKEN;
  });

  it("getToken() returns null when no env var and no config file", () => {
    expect(getToken()).toBeNull();
  });

  it("setToken() succeeds using default configStore", () => {
    expect(() => setToken("my-token")).not.toThrow();
  });

  it("deleteToken() succeeds using default configStore", () => {
    expect(() => deleteToken()).not.toThrow();
  });
});
