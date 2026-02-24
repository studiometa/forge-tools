import { describe, expect, it } from "vitest";

import type { RecipeResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { getRecipe } from "./get.ts";

describe("getRecipe", () => {
  it("should get a recipe and format output", async () => {
    const recipe = {
      id: 8,
      name: "deploy-script",
      user: "root",
      script: "echo hello",
    };

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ recipe }) as RecipeResponse,
      } as never,
    });

    const result = await getRecipe({ id: "8" }, ctx);

    expect(result.data.name).toBe("deploy-script");
    expect(result.text).toContain("deploy-script");
    expect(result.text).toContain("root");
    expect(result.text).toContain("echo hello");
  });
});
