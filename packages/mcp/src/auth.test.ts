import { describe, it, expect } from "vitest";

import { parseAuthHeader } from "./auth.ts";

describe("parseAuthHeader", () => {
  it("returns null for undefined header", () => {
    expect(parseAuthHeader(undefined)).toBeNull();
  });

  it("returns null for null header", () => {
    expect(parseAuthHeader(null)).toBeNull();
  });

  it("returns null for empty header", () => {
    expect(parseAuthHeader("")).toBeNull();
  });

  it("returns null for non-Bearer auth", () => {
    expect(parseAuthHeader("Basic abc123")).toBeNull();
  });

  it("returns null for Bearer with no token", () => {
    expect(parseAuthHeader("Bearer ")).toBeNull();
  });

  it("parses a raw API token", () => {
    const result = parseAuthHeader("Bearer my-api-token-1234");
    expect(result).toEqual({ apiToken: "my-api-token-1234" });
  });

  it("trims whitespace from token", () => {
    const result = parseAuthHeader("Bearer   my-token   ");
    expect(result).toEqual({ apiToken: "my-token" });
  });

  it("handles case-insensitive Bearer prefix", () => {
    const result = parseAuthHeader("bearer my-api-token");
    expect(result).not.toBeNull();
    expect(result?.apiToken).toBe("my-api-token");
  });

  it("parses token with special characters", () => {
    const result = parseAuthHeader("Bearer pk_test_abc123XYZ");
    expect(result).toEqual({ apiToken: "pk_test_abc123XYZ" });
  });

  it("returns null for Bearer with empty token after trimming", () => {
    const result = parseAuthHeader("Bearer   ");
    expect(result).toBeNull();
  });
});
