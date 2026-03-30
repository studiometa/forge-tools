import {
  unwrapDocument,
  jsonApiDocumentSchema,
  DeploymentOutputAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { GetDeploymentLogOptions } from "./types.ts";

/**
 * Get the deployment log for a site.
 */
export async function getDeploymentLog(
  options: GetDeploymentLogOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<string>> {
  const response = await request(
    ROUTES.deployments.getLog,
    ctx,
    { server_id: options.server_id, site_id: options.site_id, id: options.deployment_id },
    { schema: jsonApiDocumentSchema(DeploymentOutputAttributesSchema) },
  );
  const result = unwrapDocument(response);

  return { data: result.output };
}
