import type { ForgeRecipe, RecipesResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export async function listRecipes(
  _options: Record<string, never>,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeRecipe[]>> {
  const response = await ctx.client.get<RecipesResponse>("/recipes");
  const recipes = response.recipes;
  const lines = recipes.map((r) => `• ${r.name} (ID: ${r.id}) — user: ${r.user}`);

  return {
    data: recipes,
    text:
      recipes.length > 0
        ? `${recipes.length} recipe(s):\n${lines.join("\n")}`
        : "No recipes found.",
  };
}
