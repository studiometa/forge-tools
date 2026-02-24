import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { DeleteMonitorOptions } from "./types.ts";

export async function deleteMonitor(
  options: DeleteMonitorOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(`/servers/${options.server_id}/monitors/${options.id}`);

  return {
    data: undefined,
  };
}
