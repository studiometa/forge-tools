import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * Delete a database.
 */
export async function deleteDatabase(
  options: { server_id: string; id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(`/servers/${options.server_id}/databases/${options.id}`);

  return {
    data: undefined,
    text: `Database ${options.id} deleted.`,
  };
}
