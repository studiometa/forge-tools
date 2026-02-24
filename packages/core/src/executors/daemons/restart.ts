import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { RestartDaemonOptions } from "./types.ts";

/**
 * Restart a daemon.
 */
export async function restartDaemon(
  options: RestartDaemonOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.post(`/servers/${options.server_id}/daemons/${options.id}/restart`, {});

  return {
    data: undefined,
  };
}
