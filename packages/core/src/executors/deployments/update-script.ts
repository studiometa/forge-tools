import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export interface UpdateDeploymentScriptOptions {
  server_id: string;
  site_id: string;
  content: string;
}

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
  };
}
