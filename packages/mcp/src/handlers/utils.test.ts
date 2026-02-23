import { describe, expect, it } from "vitest";

import { errorResult, inputErrorResult, jsonResult } from "./utils.ts";

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
});
