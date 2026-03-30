import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { DeleteRecipeOptions } from "./types.ts";

/**
 * Delete a recipe.
 */
export async function deleteRecipe(
  options: DeleteRecipeOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(ROUTES.recipes.delete, ctx, { id: options.id });

  return {
    data: undefined,
  };
}
