/**
 * Unit tests for executeToolWithCredentials error handling.
 *
 * Tests the catch block paths that are not easily triggered via the e2e test.
 */
import { describe, expect, it, vi } from "vitest";

import { UserInputError } from "../errors.ts";

// Mock servers handler to throw a UserInputError
vi.mock("./servers.ts", async (importOriginal) => {
  const mod = await importOriginal<typeof import("./servers.ts")>();
  return {
    ...mod,
    handleServers: vi.fn().mockRejectedValue(new UserInputError("Test input error", ["Hint A"])),
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
});
