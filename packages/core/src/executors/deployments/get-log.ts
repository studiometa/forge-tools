import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { GetDeploymentLogOptions } from "./types.ts";

/**
 * Get the deployment log for a site.
 */
export async function getDeploymentLog(
  options: GetDeploymentLogOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<string>> {
  const log = await ctx.client.get<string>(
    `/servers/${options.server_id}/sites/${options.site_id}/deployment/log`,
  );
  return { data: log };
}
