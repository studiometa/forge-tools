import type { ForgeRecipe, RecipesResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export async function listRecipes(
  _options: Record<string, never>,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeRecipe[]>> {
  const response = await ctx.client.get<RecipesResponse>("/recipes");
  const recipes = response.recipes;
  return {
    data: recipes,
  };
}
