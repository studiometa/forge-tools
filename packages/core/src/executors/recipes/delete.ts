import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export async function deleteRecipe(
  options: { id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(`/recipes/${options.id}`);

  return {
    data: undefined,
  };
}
