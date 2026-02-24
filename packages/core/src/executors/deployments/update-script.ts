import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { UpdateDeploymentScriptOptions } from "./types.ts";

/**
 * Update the deployment script for a site.
 */
export async function updateDeploymentScript(
  options: UpdateDeploymentScriptOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.put(`/servers/${options.server_id}/sites/${options.site_id}/deployment/script`, {
    content: options.content,
  });

  return {
    data: undefined,
    text: `Deployment script updated for site ${options.site_id} on server ${options.server_id}.`,
  };
}
