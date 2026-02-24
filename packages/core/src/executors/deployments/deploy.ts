import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { DeploySiteOptions } from "./types.ts";

/**
 * Trigger a deployment for a site.
 */
export async function deploySite(
  options: DeploySiteOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.post(`/servers/${options.server_id}/sites/${options.site_id}/deployment/deploy`);

  return {
    data: undefined,
    text: `Deployment triggered for site ${options.site_id} on server ${options.server_id}.`,
  };
}
