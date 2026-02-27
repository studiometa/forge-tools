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

  // OAuth base64-encoded access token tests
  describe("base64-encoded access tokens (OAuth flow)", () => {
    it("decodes a base64-encoded API token", () => {
      const rawToken = "my-forge-api-token-1234";
      const base64Token = Buffer.from(rawToken).toString("base64");
      const result = parseAuthHeader(`Bearer ${base64Token}`);
      expect(result).toEqual({ apiToken: rawToken });
    });

    it("decodes a base64-encoded token with special characters", () => {
      const rawToken = "pk_test_abc123XYZ!@#";
      const base64Token = Buffer.from(rawToken).toString("base64");
      const result = parseAuthHeader(`Bearer ${base64Token}`);
      expect(result).toEqual({ apiToken: rawToken });
    });

    it("keeps raw token when base64 roundtrip does not match", () => {
      // A token that doesn't roundtrip as valid base64
      const result = parseAuthHeader("Bearer not-valid-base64-token!");
      expect(result).toEqual({ apiToken: "not-valid-base64-token!" });
    });

    it("keeps raw token when decoded equals the input (identity decode)", () => {
      // Some short ASCII strings decode from base64 to themselves or produce
      // the same string — these should be treated as raw tokens.
      // "aa" in base64 decodes to binary that differs, but re-encode won't match "aa"
      const result = parseAuthHeader("Bearer aa");
      expect(result).toEqual({ apiToken: "aa" });
    });

    it("keeps raw token for single character that decodes to empty", () => {
      // "A" decodes from base64 to a null byte, which is a non-printable char
      // but not empty. The roundtrip won't match, so it stays as raw token.
      const result = parseAuthHeader("Bearer A");
      expect(result).toEqual({ apiToken: "A" });
    });
  });
});
