import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export interface GetDeploymentOutputOptions {
  server_id: number;
  site_id: number;
  deployment_id: number;
}

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
    text: `Deployment ${options.deployment_id} output:\n${output}`,
  };
}
