import type { CreateRecipeData, ForgeRecipe, RecipeResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export async function createRecipe(
  options: CreateRecipeData,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeRecipe>> {
  const response = await ctx.client.post<RecipeResponse>("/recipes", options);
  const recipe = response.recipe;

  return {
    data: recipe,
    text: `Recipe created: ${recipe.name} (ID: ${recipe.id})`,
  };
}
