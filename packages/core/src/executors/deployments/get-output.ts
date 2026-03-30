import type { JsonApiDocument, DeploymentOutputAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  DeploymentOutputAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { GetDeploymentOutputOptions } from "./types.ts";

/**
 * Get the output of a deployment.
 */
export async function getDeploymentOutput(
  options: GetDeploymentOutputOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<string>> {
  const response = await request<JsonApiDocument<DeploymentOutputAttributes>>(
    ROUTES.deployments.getLog,
    ctx,
    { server_id: options.server_id, site_id: options.site_id, id: options.deployment_id },
    { schema: jsonApiDocumentSchema(DeploymentOutputAttributesSchema) },
  );
  const result = unwrapDocument(response);

  return {
    data: result.output,
  };
}
