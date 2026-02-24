import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export interface DeleteSiteOptions {
  server_id: string;
  site_id: string;
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
  };
}
