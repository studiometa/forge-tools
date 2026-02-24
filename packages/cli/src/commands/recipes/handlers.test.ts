import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { ForgeRecipe } from "@studiometa/forge-api";

import { createTestContext } from "../../context.ts";
import { recipesList, recipesGet, recipesRun } from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  listRecipes: vi.fn(),
  getRecipe: vi.fn(),
  runRecipe: vi.fn(),
}));

const mockRecipe: ForgeRecipe = {
  id: 1,
  name: "Deploy Script",
  user: "forge",
  script: "cd /home/forge && ./deploy.sh",
  created_at: "2024-01-01T00:00:00Z",
};

describe("recipesList", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should list recipes", async () => {
    const { listRecipes } = await import("@studiometa/forge-core");
    vi.mocked(listRecipes).mockResolvedValue({ data: [mockRecipe] });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await recipesList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"Deploy Script"'));
  });

  it("should handle errors", async () => {
    const { listRecipes } = await import("@studiometa/forge-core");
    vi.mocked(listRecipes).mockRejectedValue(new Error("API error"));

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await recipesList(ctx);
    expect(processExitSpy).toHaveBeenCalled();
  });
});

describe("recipesGet", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should get recipe by id", async () => {
    const { getRecipe } = await import("@studiometa/forge-core");
    vi.mocked(getRecipe).mockResolvedValue({ data: mockRecipe });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await recipesGet(["1"], ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"Deploy Script"'));
  });

  it("should exit with error when no id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await recipesGet([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("recipesRun", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should run recipe on servers", async () => {
    const { runRecipe } = await import("@studiometa/forge-core");
    vi.mocked(runRecipe).mockResolvedValue({ data: undefined as never });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", servers: "1,2,3" },
    });

    await recipesRun(["1"], ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining("dispatched"));
  });

  it("should exit with error when no id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", servers: "1" },
    });

    await recipesRun([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no servers", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await recipesRun(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});
