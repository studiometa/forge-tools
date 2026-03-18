import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { UpdateDeploymentScriptOptions } from "./types.ts";

/**
 * Update the deployment script for a site.
 */
export async function updateDeploymentScript(
  options: UpdateDeploymentScriptOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.put(`${sitePath(options.server_id, options.site_id, ctx)}/deployments/script`, {
    content: options.content,
  });

  return {
    data: undefined,
  };
}
