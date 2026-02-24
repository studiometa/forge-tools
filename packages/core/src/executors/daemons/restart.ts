import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * Restart a daemon.
 */
export async function restartDaemon(
  options: { server_id: string; id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.post(`/servers/${options.server_id}/daemons/${options.id}/restart`, {});

  return {
    data: undefined,
  };
}
