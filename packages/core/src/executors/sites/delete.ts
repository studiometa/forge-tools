import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { DeleteSiteOptions } from "./types.ts";

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
