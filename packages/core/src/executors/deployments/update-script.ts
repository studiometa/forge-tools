import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { UpdateDeploymentScriptOptions } from "./types.ts";

/**
 * Update the deployment script for a site.
 */
export async function updateDeploymentScript(
  options: UpdateDeploymentScriptOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(
    ROUTES.deployments.updateScript,
    ctx,
    { server_id: options.server_id, site_id: options.site_id },
    { body: { content: options.content } },
  );

  return {
    data: undefined,
  };
}
