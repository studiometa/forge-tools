import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { RebootServerOptions } from "./types.ts";

/**
 * Reboot a server.
 */
export async function rebootServer(
  options: RebootServerOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.post(`/servers/${options.server_id}/reboot`);

  return {
    data: undefined,
  };
}
