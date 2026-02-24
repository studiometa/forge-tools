import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export interface RebootServerOptions {
  server_id: string;
}

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
