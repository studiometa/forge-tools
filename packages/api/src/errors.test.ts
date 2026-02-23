import { describe, expect, it } from "vitest";

import { ForgeApiError, isForgeApiError } from "./errors.ts";

describe("ForgeApiError", () => {
  it("should create error with all properties", () => {
    const error = new ForgeApiError({
      status: 404,
      message: "Not found",
      url: "/servers/999",
      body: { message: "Not found" },
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("ForgeApiError");
    expect(error.status).toBe(404);
    expect(error.message).toBe("Not found");
    expect(error.url).toBe("/servers/999");
    expect(error.body).toEqual({ message: "Not found" });
  });

  it("should handle missing body", () => {
    const error = new ForgeApiError({
      status: 500,
      message: "Server error",
      url: "/servers",
    });

    expect(error.body).toBeUndefined();
  });

  describe("statusText", () => {
    const cases = [
      [401, "Invalid API token"],
      [403, "Insufficient permissions"],
      [404, "Resource not found"],
      [422, "Validation error"],
      [429, "Rate limit exceeded"],
      [500, "Forge server error"],
      [502, "HTTP 502"],
    ] as const;

    for (const [status, expected] of cases) {
      it(`should return "${expected}" for status ${status}`, () => {
        const error = new ForgeApiError({
          status,
          message: "test",
          url: "/test",
        });
        expect(error.statusText).toBe(expected);
      });
    }
  });
});

describe("isForgeApiError", () => {
  it("should return true for ForgeApiError instances", () => {
    const error = new ForgeApiError({
      status: 404,
      message: "Not found",
      url: "/test",
    });
    expect(isForgeApiError(error)).toBe(true);
  });

  it("should return false for regular errors", () => {
    expect(isForgeApiError(new Error("regular"))).toBe(false);
  });

  it("should return false for non-error values", () => {
    expect(isForgeApiError(null)).toBe(false);
    expect(isForgeApiError(undefined)).toBe(false);
    expect(isForgeApiError("string")).toBe(false);
    expect(isForgeApiError(42)).toBe(false);
  });
});
