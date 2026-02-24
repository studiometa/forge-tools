import { describe, expect, it } from "vitest";

import { UserInputError } from "../errors.ts";
import { errorResult, inputErrorResult, jsonResult, sanitizeId } from "./utils.ts";

describe("jsonResult", () => {
  it("should create a text result from string", () => {
    const result = jsonResult("Hello");
    expect(result.content).toHaveLength(1);
    expect(result.content[0]!.text).toBe("Hello");
    expect(result.isError).toBeUndefined();
  });

  it("should create a JSON result from object", () => {
    const result = jsonResult({ name: "test", value: 42 });
    expect(result.content[0]!.text).toBe('{\n  "name": "test",\n  "value": 42\n}');
  });
});

describe("errorResult", () => {
  it("should create an error result", () => {
    const result = errorResult("Something failed");
    expect(result.content[0]!.text).toContain("Error:");
    expect(result.isError).toBe(true);
  });
});

describe("inputErrorResult", () => {
  it("should create an error with suggestion", () => {
    const result = inputErrorResult("Invalid input", "Try this instead");
    expect(result.content[0]!.text).toContain("Invalid input");
    expect(result.content[0]!.text).toContain("Suggestion");
  });

  it("should create an error without suggestion", () => {
    const result = inputErrorResult("Invalid input");
    expect(result.content[0]!.text).toContain("Invalid input");
    expect(result.content[0]!.text).not.toContain("Suggestion");
  });

  it("should render UserInputError formatted message", () => {
    const error = new UserInputError("Missing field", ["Hint A", "Hint B"]);
    const result = inputErrorResult(error);
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("**Input Error:** Missing field");
    expect(result.content[0]!.text).toContain("- Hint A");
    expect(result.content[0]!.text).toContain("- Hint B");
  });

  it("should render UserInputError without hints", () => {
    const error = new UserInputError("Simple error");
    const result = inputErrorResult(error);
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toBe("**Input Error:** Simple error");
  });
});

describe("sanitizeId", () => {
  it("should accept numeric IDs", () => {
    expect(sanitizeId("123")).toBe(true);
    expect(sanitizeId("0")).toBe(true);
  });

  it("should accept alphanumeric IDs", () => {
    expect(sanitizeId("abc123")).toBe(true);
    expect(sanitizeId("my-key")).toBe(true);
    expect(sanitizeId("my_key")).toBe(true);
  });

  it("should reject path traversal", () => {
    expect(sanitizeId("../etc/passwd")).toBe(false);
    expect(sanitizeId("1/../../secrets")).toBe(false);
    expect(sanitizeId("..")).toBe(false);
  });

  it("should reject empty strings", () => {
    expect(sanitizeId("")).toBe(false);
  });

  it("should reject special characters", () => {
    expect(sanitizeId("1;rm -rf")).toBe(false);
    expect(sanitizeId("1&id")).toBe(false);
  });
});
