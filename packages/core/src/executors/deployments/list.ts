import type { DeploymentAttributes } from "@studiometa/forge-api";
import {
  unwrapListDocument,
  jsonApiListDocumentSchema,
  DeploymentAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { ListDeploymentsOptions } from "./types.ts";

/**
 * List the latest deployments (one page, newest first) of a site, or of every site of the
 * server without `site_id`.
 */
export async function listDeployments(
  options: ListDeploymentsOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<DeploymentAttributes & { id: number }>>> {
  const { server_id, site_id } = options;
  const response = await request(
    site_id ? ROUTES.deployments.list : ROUTES.deployments.listForServer,
    ctx,
    site_id ? { server_id, site_id } : { server_id },
    {
      query: { sort: "-created_at" },
      schema: jsonApiListDocumentSchema(DeploymentAttributesSchema),
    },
  );

  return {
    data: unwrapListDocument(response),
  };
}
