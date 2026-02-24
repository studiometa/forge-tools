import { describe, it, expect, afterEach } from "vitest";

import { colors, setColorEnabled, isColorEnabled } from "./colors.ts";

describe("colors", () => {
  afterEach(() => {
    setColorEnabled(true);
  });

  it("should return colored text when colors enabled", () => {
    setColorEnabled(true);
    const result = colors.bold("hello");
    expect(result).toContain("hello");
    expect(result).toContain("\x1b[");
  });

  it("should return plain text when colors disabled", () => {
    setColorEnabled(false);
    const result = colors.bold("hello");
    expect(result).toBe("hello");
  });

  it("isColorEnabled should reflect current state", () => {
    setColorEnabled(true);
    expect(isColorEnabled()).toBe(true);
    setColorEnabled(false);
    expect(isColorEnabled()).toBe(false);
  });

  it("should apply all color functions", () => {
    setColorEnabled(true);
    expect(colors.reset("x")).toContain("x");
    expect(colors.bold("x")).toContain("x");
    expect(colors.dim("x")).toContain("x");
    expect(colors.red("x")).toContain("x");
    expect(colors.green("x")).toContain("x");
    expect(colors.yellow("x")).toContain("x");
    expect(colors.cyan("x")).toContain("x");
    expect(colors.gray("x")).toContain("x");
  });

  it("should strip ANSI codes when disabled", () => {
    setColorEnabled(false);
    expect(colors.red("error")).toBe("error");
    expect(colors.green("ok")).toBe("ok");
    expect(colors.reset("text")).toBe("text");
  });
});
