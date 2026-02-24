import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { DeleteServerOptions } from "./types.ts";

/**
 * Delete a server.
 */
export async function deleteServer(
  options: DeleteServerOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(`/servers/${options.server_id}`);

  return {
    data: undefined,
  };
}
