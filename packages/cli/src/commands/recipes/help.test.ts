import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { showRecipesHelp } from "./help.ts";

describe("showRecipesHelp", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show general help", () => {
    showRecipesHelp();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("recipes"));
  });

  it("should show list help", () => {
    showRecipesHelp("list");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("recipes list"));
  });

  it("should show list help for ls", () => {
    showRecipesHelp("ls");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("recipes list"));
  });

  it("should show get help", () => {
    showRecipesHelp("get");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("recipe_id"));
  });

  it("should show run help", () => {
    showRecipesHelp("run");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("servers"));
  });
});
