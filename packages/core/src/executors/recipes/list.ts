import type { ForgeRecipe, RecipesResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { ListRecipesOptions } from "./types.ts";

export async function listRecipes(
  _options: ListRecipesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeRecipe[]>> {
  const response = await ctx.client.get<RecipesResponse>("/recipes");
  const recipes = response.recipes;
  return {
    data: recipes,
  };
}
