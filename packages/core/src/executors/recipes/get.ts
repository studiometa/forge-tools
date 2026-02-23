import type { ForgeRecipe, RecipeResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export async function getRecipe(
  options: { id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeRecipe>> {
  const response = await ctx.client.get<RecipeResponse>(`/recipes/${options.id}`);
  const recipe = response.recipe;

  return {
    data: recipe,
    text: `Recipe: ${recipe.name} (ID: ${recipe.id})\nUser: ${recipe.user}\nScript:\n${recipe.script}`,
  };
}
