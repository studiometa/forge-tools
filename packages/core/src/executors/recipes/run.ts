import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * Run a recipe on specified servers.
 */
export async function runRecipe(
  options: { id: string; servers: number[] },
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.post(`/recipes/${options.id}/run`, {
    servers: options.servers,
  });

  return {
    data: undefined,
  };
}
