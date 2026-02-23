import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export interface DeleteServerOptions {
  server_id: string;
}

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
    text: `Server ${options.server_id} deleted.`,
  };
}
