import { describe, it, expect } from "vitest";

import { CliError, ConfigError, ValidationError, ApiError, isCliError } from "./errors.ts";

describe("ConfigError", () => {
  it("should create missingToken error", () => {
    const err = ConfigError.missingToken();
    expect(err.code).toBe("CONFIG_ERROR");
    expect(err.isRecoverable).toBe(true);
    expect(err.message).toContain("token");
    expect(err.hints).toBeDefined();
    expect(err.hints!.length).toBeGreaterThan(0);
  });

  it("should include hints in formatted message", () => {
    const err = ConfigError.missingToken();
    const formatted = err.toFormattedMessage();
    expect(formatted).toContain("Hints:");
    expect(formatted).toContain("•");
  });

  it("should serialize to JSON", () => {
    const err = ConfigError.missingToken();
    const json = err.toJSON();
    expect(json.error).toBe("CONFIG_ERROR");
    expect(json.name).toBe("ConfigError");
    expect(json.message).toBeTruthy();
    expect(json.isRecoverable).toBe(true);
    expect(json.hints).toBeDefined();
  });

  it("toFormattedMessage without hints returns just message", () => {
    const err = new ConfigError("simple error");
    const msg = err.toFormattedMessage();
    expect(msg).toBe("simple error");
  });

  it("toJSON should include cause if it is an Error", () => {
    const cause = new Error("root cause");
    const err = new ConfigError("wrapper", undefined, cause);
    const json = err.toJSON();
    expect((json.cause as { message: string }).message).toBe("root cause");
  });

  it("toJSON should not include cause if it is not an Error", () => {
    const err = new ConfigError("wrapper", undefined, "string cause");
    const json = err.toJSON();
    expect(json.cause).toBeUndefined();
  });
});

describe("ValidationError", () => {
  it("should create required error", () => {
    const err = ValidationError.required("server_id");
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.isRecoverable).toBe(true);
    expect(err.message).toContain("server_id");
    expect(err.field).toBe("server_id");
  });

  it("should include field in JSON", () => {
    const err = ValidationError.required("site_id", ["Usage: forge-cli sites get <site_id>"]);
    const json = err.toJSON();
    expect(json.field).toBe("site_id");
    expect(json.hints).toContain("Usage: forge-cli sites get <site_id>");
  });

  it("should create without hints", () => {
    const err = ValidationError.required("id");
    expect(err.hints).toBeUndefined();
  });
});

describe("ApiError", () => {
  it("should be non-recoverable for 401", () => {
    const err = new ApiError("Unauthorized", 401);
    expect(err.isRecoverable).toBe(false);
    expect(err.hints).toContain("Check that your API token is valid");
  });

  it("should be non-recoverable for 403", () => {
    const err = new ApiError("Forbidden", 403);
    expect(err.isRecoverable).toBe(false);
  });

  it("should be non-recoverable for 404", () => {
    const err = new ApiError("Not Found", 404);
    expect(err.isRecoverable).toBe(false);
    expect(err.hints).toContain("The resource may not exist");
  });

  it("should be recoverable for 429", () => {
    const err = new ApiError("Rate limit", 429);
    expect(err.isRecoverable).toBe(false);
    expect(err.hints).toContain("Too many requests — wait before retrying");
  });

  it("should be recoverable for 500", () => {
    const err = new ApiError("Server error", 500);
    expect(err.isRecoverable).toBe(true);
    expect(err.hints).toContain("Server error — try again later");
  });

  it("should be recoverable when no status code", () => {
    const err = new ApiError("Network error");
    expect(err.isRecoverable).toBe(true);
  });

  it("should have empty hints for non-special status codes", () => {
    const err = new ApiError("Bad request", 400);
    expect(err.hints).toEqual([]);
  });

  it("should include statusCode in JSON", () => {
    const err = new ApiError("Not Found", 404);
    const json = err.toJSON();
    expect(json.statusCode).toBe(404);
  });

  it("fromForgeError should wrap Error with statusCode", () => {
    const orig = Object.assign(new Error("API failed"), { statusCode: 404 });
    const err = ApiError.fromForgeError(orig);
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe("API failed");
  });

  it("fromForgeError should wrap plain Error", () => {
    const orig = new Error("plain error");
    const err = ApiError.fromForgeError(orig);
    expect(err.message).toBe("plain error");
    expect(err.statusCode).toBeUndefined();
  });

  it("fromForgeError should wrap unknown value", () => {
    const err = ApiError.fromForgeError("some string");
    expect(err.message).toBe("some string");
  });
});

describe("isCliError", () => {
  it("should return true for CliError instances", () => {
    expect(isCliError(ConfigError.missingToken())).toBe(true);
    expect(isCliError(ValidationError.required("x"))).toBe(true);
    expect(isCliError(new ApiError("err"))).toBe(true);
  });

  it("should return false for non-CliError", () => {
    expect(isCliError(new Error("plain"))).toBe(false);
    expect(isCliError("string")).toBe(false);
    expect(isCliError(null)).toBe(false);
  });
});

describe("CliError abstract contract", () => {
  it("should set name to constructor name", () => {
    const err = ConfigError.missingToken();
    expect(err.name).toBe("ConfigError");
  });

  it("ValidationError name should be ValidationError", () => {
    const err = ValidationError.required("x");
    expect(err.name).toBe("ValidationError");
  });

  it("should be an instance of Error", () => {
    const err = ConfigError.missingToken();
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(CliError);
  });
});
