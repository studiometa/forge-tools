import type { JsonApiListDocument, DeploymentAttributes } from "@studiometa/forge-api";
import {
  unwrapListDocument,
  jsonApiListDocumentSchema,
  DeploymentAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { ListDeploymentsOptions } from "./types.ts";

/**
 * List all deployments for a site.
 */
export async function listDeployments(
  options: ListDeploymentsOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<DeploymentAttributes & { id: number }>>> {
  const response = await request<JsonApiListDocument<DeploymentAttributes>>(
    ROUTES.deployments.list,
    ctx,
    { server_id: options.server_id, site_id: options.site_id },
    {
      query: { sort: "-created_at" },
      schema: jsonApiListDocumentSchema(DeploymentAttributesSchema),
    },
  );

  return {
    data: unwrapListDocument(response),
  };
}
