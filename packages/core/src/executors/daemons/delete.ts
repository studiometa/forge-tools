import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * Delete a daemon.
 */
export async function deleteDaemon(
  options: { server_id: string; id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(`/servers/${options.server_id}/daemons/${options.id}`);

  return {
    data: undefined,
    text: `Daemon ${options.id} deleted.`,
  };
}
