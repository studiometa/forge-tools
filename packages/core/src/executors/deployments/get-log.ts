import type { JsonApiDocument, DeploymentOutputAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { GetDeploymentLogOptions } from "./types.ts";

/**
 * Get the deployment log for a site.
 */
export async function getDeploymentLog(
  options: GetDeploymentLogOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<string>> {
  const response = await ctx.client.get<JsonApiDocument<DeploymentOutputAttributes>>(
    `${sitePath(options.server_id, options.site_id, ctx)}/deployments/log`,
  );
  const result = unwrapDocument(response);

  return { data: result.output };
}
