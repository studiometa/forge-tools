import { describe, expect, it } from "vitest";

import type { RecipeResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { createRecipe } from "./create.ts";

describe("createRecipe", () => {
  it("should create a recipe and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          ({
            recipe: { id: 8, name: "deploy-script" },
          }) as RecipeResponse,
      } as never,
    });

    const result = await createRecipe(
      { name: "deploy-script", user: "root", script: "echo hello" },
      ctx,
    );

    expect(result.data.name).toBe("deploy-script");
    expect(result.text).toContain("deploy-script");
    expect(result.text).toContain("8");
  });
});
