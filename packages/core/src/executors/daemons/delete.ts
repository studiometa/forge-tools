import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { DeleteDaemonOptions } from "./types.ts";

/**
 * Delete a daemon.
 */
export async function deleteDaemon(
  options: DeleteDaemonOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(`/servers/${options.server_id}/daemons/${options.id}`);

  return {
    data: undefined,
    text: `Daemon ${options.id} deleted.`,
  };
}
