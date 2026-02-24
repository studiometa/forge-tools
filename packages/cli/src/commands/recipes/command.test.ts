import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleRecipesCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  recipesList: vi.fn().mockResolvedValue(undefined),
  recipesGet: vi.fn().mockResolvedValue(undefined),
  recipesRun: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../context.ts", () => ({
  createContext: vi.fn().mockReturnValue({
    options: {},
    formatter: { output: vi.fn(), error: vi.fn() },
  }),
}));

vi.mock("../../output.ts", () => ({
  OutputFormatter: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.output = vi.fn();
    this.error = vi.fn();
  }),
}));

describe("handleRecipesCommand routing", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should route list", async () => {
    const h = await import("./handlers.ts");
    await handleRecipesCommand("list", [], {});
    expect(h.recipesList).toHaveBeenCalled();
  });

  it("should route run with args", async () => {
    const h = await import("./handlers.ts");
    await handleRecipesCommand("run", ["1"], {});
    expect(h.recipesRun).toHaveBeenCalledWith(["1"], expect.anything());
  });

  it("should exit for unknown subcommand", async () => {
    await handleRecipesCommand("unknown", [], {});
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
