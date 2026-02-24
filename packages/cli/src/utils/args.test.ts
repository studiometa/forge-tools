import { describe, it, expect } from "vitest";

import { parseArgs, getOption, hasFlag } from "./args.ts";

describe("parseArgs", () => {
  it("should parse command and subcommand", () => {
    const result = parseArgs(["servers", "list"]);
    expect(result.command).toEqual(["servers", "list"]);
    expect(result.positional).toEqual([]);
  });

  it("should parse long options with equals", () => {
    const result = parseArgs(["--format=json"]);
    expect(result.options.format).toBe("json");
  });

  it("should parse long options with space", () => {
    const result = parseArgs(["--format", "json"]);
    expect(result.options.format).toBe("json");
  });

  it("should parse long flags", () => {
    const result = parseArgs(["--help"]);
    expect(result.options.help).toBe(true);
  });

  it("should parse short options", () => {
    const result = parseArgs(["-f", "json"]);
    expect(result.options.f).toBe("json");
  });

  it("should parse short flags", () => {
    const result = parseArgs(["-h"]);
    expect(result.options.h).toBe(true);
  });

  it("should parse multiple short flags", () => {
    const result = parseArgs(["-vh"]);
    expect(result.options.v).toBe(true);
    expect(result.options.h).toBe(true);
  });

  it("should parse positional arguments after command and subcommand", () => {
    const result = parseArgs(["servers", "get", "123"]);
    expect(result.command).toEqual(["servers", "get"]);
    expect(result.positional).toEqual(["123"]);
  });

  it("should parse mixed arguments", () => {
    const result = parseArgs(["servers", "list", "--format", "json", "-v"]);
    expect(result.command).toEqual(["servers", "list"]);
    expect(result.positional).toEqual([]);
    expect(result.options.format).toBe("json");
    expect(result.options.v).toBe(true);
  });

  it("should handle no arguments", () => {
    const result = parseArgs([]);
    expect(result.command).toEqual([]);
    expect(result.positional).toEqual([]);
    expect(result.options).toEqual({});
  });

  it("should handle --no-color flag", () => {
    const result = parseArgs(["--no-color"]);
    expect(result.options["no-color"]).toBe(true);
  });

  it("should handle flag followed by another flag (not consuming next flag as value)", () => {
    const result = parseArgs(["--help", "--format", "json"]);
    expect(result.options.help).toBe(true);
    expect(result.options.format).toBe("json");
  });

  it("should handle short flag followed by another flag", () => {
    const result = parseArgs(["-h", "--version"]);
    expect(result.options.h).toBe(true);
    expect(result.options.version).toBe(true);
  });

  it("should treat more than 2 positional commands as positionals", () => {
    const result = parseArgs(["servers", "get", "123", "456"]);
    expect(result.command).toEqual(["servers", "get"]);
    expect(result.positional).toEqual(["123", "456"]);
  });
});

describe("getOption", () => {
  it("should get option by first matching name", () => {
    const options = { format: "json" };
    const result = getOption(options, ["format", "f"]);
    expect(result).toBe("json");
  });

  it("should get option by second name if first not found", () => {
    const options = { f: "json" };
    const result = getOption(options, ["format", "f"]);
    expect(result).toBe("json");
  });

  it("should return default if not found", () => {
    const options = {};
    const result = getOption(options, ["format", "f"], "human");
    expect(result).toBe("human");
  });

  it("should return undefined if not found and no default", () => {
    const options = {};
    const result = getOption(options, ["format", "f"]);
    expect(result).toBeUndefined();
  });

  it("should return undefined for boolean flags", () => {
    const options = { help: true };
    const result = getOption(options, ["help"]);
    expect(result).toBeUndefined();
  });

  it("should return undefined for array values", () => {
    const options = { filter: ["a=1", "b=2"] };
    const result = getOption(options, ["filter"]);
    expect(result).toBeUndefined();
  });
});

describe("hasFlag", () => {
  it("should return true if flag exists", () => {
    const options = { help: true };
    const result = hasFlag(options, ["help", "h"]);
    expect(result).toBe(true);
  });

  it("should return true for any matching name", () => {
    const options = { h: true };
    const result = hasFlag(options, ["help", "h"]);
    expect(result).toBe(true);
  });

  it("should return false if flag not found", () => {
    const options = {};
    const result = hasFlag(options, ["help", "h"]);
    expect(result).toBe(false);
  });

  it("should return false if option is string value", () => {
    const options = { help: "yes" };
    const result = hasFlag(options, ["help"]);
    expect(result).toBe(false);
  });
});
