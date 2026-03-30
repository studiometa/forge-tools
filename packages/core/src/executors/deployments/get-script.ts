import type { JsonApiDocument, DeploymentScriptAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { GetDeploymentScriptOptions } from "./types.ts";

/**
 * Get the deployment script for a site.
 */
export async function getDeploymentScript(
  options: GetDeploymentScriptOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<string>> {
  const response = await ctx.client.get<JsonApiDocument<DeploymentScriptAttributes>>(
    `${sitePath(options.server_id, options.site_id, ctx)}/deployments/script`,
  );
  const result = unwrapDocument(response);

  return {
    data: result.content,
  };
}
