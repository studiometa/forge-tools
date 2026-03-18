import type { JsonApiListDocument, DeploymentAttributes } from "@studiometa/forge-api";
import { unwrapListDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { ListDeploymentsOptions } from "./types.ts";

/**
 * List all deployments for a site.
 */
export async function listDeployments(
  options: ListDeploymentsOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<DeploymentAttributes & { id: number }>>> {
  const response = await ctx.client.get<JsonApiListDocument<DeploymentAttributes>>(
    `${sitePath(options.server_id, options.site_id, ctx)}/deployments?sort=-created_at`,
  );

  return {
    data: unwrapListDocument(response),
  };
}
