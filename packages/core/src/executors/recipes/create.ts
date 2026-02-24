import type { ForgeRecipe, RecipeResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { CreateRecipeOptions } from "./types.ts";

export async function createRecipe(
  options: CreateRecipeOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeRecipe>> {
  const response = await ctx.client.post<RecipeResponse>("/recipes", options);
  const recipe = response.recipe;

  return {
    data: recipe,
  };
}
