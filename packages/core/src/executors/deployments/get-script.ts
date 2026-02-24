import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export interface GetDeploymentScriptOptions {
  server_id: string;
  site_id: string;
}

/**
 * Get the deployment script for a site.
 */
export async function getDeploymentScript(
  options: GetDeploymentScriptOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<string>> {
  const script = await ctx.client.get<string>(
    `/servers/${options.server_id}/sites/${options.site_id}/deployment/script`,
  );

  return {
    data: script,
  };
}
