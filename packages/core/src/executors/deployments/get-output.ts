import type { JsonApiDocument, DeploymentOutputAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { GetDeploymentOutputOptions } from "./types.ts";

/**
 * Get the output of a deployment.
 */
export async function getDeploymentOutput(
  options: GetDeploymentOutputOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<string>> {
  const response = await ctx.client.get<JsonApiDocument<DeploymentOutputAttributes>>(
    `${sitePath(options.server_id, options.site_id, ctx)}/deployments/${options.deployment_id}/output`,
  );
  const result = unwrapDocument(response);

  return {
    data: result.output,
  };
}
