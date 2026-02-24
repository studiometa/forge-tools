import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { GetDeploymentOutputOptions } from "./types.ts";

/**
 * Get the output of a deployment.
 */
export async function getDeploymentOutput(
  options: GetDeploymentOutputOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<string>> {
  const output = await ctx.client.get<string>(
    `/servers/${options.server_id}/sites/${options.site_id}/deployments/${options.deployment_id}/output`,
  );

  return {
    data: output,
  };
}
