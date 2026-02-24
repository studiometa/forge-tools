import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { DeleteRecipeOptions } from "./types.ts";

export async function deleteRecipe(
  options: DeleteRecipeOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(`/recipes/${options.id}`);

  return {
    data: undefined,
    text: `Recipe ${options.id} deleted.`,
  };
}
