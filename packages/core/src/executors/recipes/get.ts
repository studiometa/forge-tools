import type { ForgeRecipe, RecipeResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { GetRecipeOptions } from "./types.ts";

export async function getRecipe(
  options: GetRecipeOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeRecipe>> {
  const response = await ctx.client.get<RecipeResponse>(`/recipes/${options.id}`);
  const recipe = response.recipe;

  return {
    data: recipe,
    text: `Recipe: ${recipe.name} (ID: ${recipe.id})\nUser: ${recipe.user}\nScript:\n${recipe.script}`,
  };
}
