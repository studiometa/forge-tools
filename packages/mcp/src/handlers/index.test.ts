/**
 * Unit tests for executeToolWithCredentials error handling.
 *
 * Tests the catch block paths that are not easily triggered via the e2e test.
 */
import { describe, expect, it, vi } from "vitest";

import { ForgeApiError } from "@studiometa/forge-api";
import { UserInputError } from "../errors.ts";

// Mock servers handler to throw errors for various error handling tests
vi.mock("./servers.ts", async (importOriginal) => {
  const mod = await importOriginal<typeof import("./servers.ts")>();
  return {
    ...mod,
    handleServers: vi.fn().mockRejectedValue(new UserInputError("Test input error", ["Hint A"])),
  };
});

// Mock sites handler to throw a ForgeApiError
vi.mock("./sites.ts", async (importOriginal) => {
  const mod = await importOriginal<typeof import("./sites.ts")>();
  return {
    ...mod,
    handleSites: vi
      .fn()
      .mockRejectedValue(
        new ForgeApiError({ status: 404, message: "Site not found", url: "/sites/1", body: null }),
      ),
  };
});

// Mock databases handler to throw a non-Error string
vi.mock("./databases.ts", async (importOriginal) => {
  const mod = await importOriginal<typeof import("./databases.ts")>();
  return {
    ...mod,
    handleDatabases: vi.fn().mockRejectedValue("string error"),
  };
});

// Mock HttpClient so we don't need real credentials
vi.mock("@studiometa/forge-api", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@studiometa/forge-api")>();
  return {
    ...mod,
    HttpClient: class MockHttpClient {
      async get() {
        return {};
      }
    },
    ForgeApiError: mod.ForgeApiError,
    isForgeApiError: mod.isForgeApiError,
  };
});

import { executeToolWithCredentials } from "./index.ts";

const creds = { apiToken: "test-token" };

describe("executeToolWithCredentials error handling", () => {
  it("should catch UserInputError thrown by a handler and return formatted error message", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "servers", action: "list" },
      creds,
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("**Input Error:** Test input error");
    expect(result.content[0]!.text).toContain("- Hint A");
  });

  it("should catch ForgeApiError and return formatted error with status", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "sites", action: "list", server_id: "1" },
      creds,
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("Forge API error");
  });

  it("should catch non-Error thrown value and stringify it", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "databases", action: "list", server_id: "1" },
      creds,
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("string error");
  });
});
