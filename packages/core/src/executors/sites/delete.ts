import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export interface DeleteSiteOptions {
  server_id: number;
  site_id: number;
}

/**
 * Delete a site.
 */
export async function deleteSite(
  options: DeleteSiteOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(`/servers/${options.server_id}/sites/${options.site_id}`);

  return {
    data: undefined,
    text: `Site ${options.site_id} deleted from server ${options.server_id}.`,
  };
}
