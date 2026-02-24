import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { RunRecipeOptions } from "./types.ts";

/**
 * Run a recipe on specified servers.
 */
export async function runRecipe(
  options: RunRecipeOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.post(`/recipes/${options.id}/run`, {
    servers: options.servers,
  });

  return {
    data: undefined,
  };
}
