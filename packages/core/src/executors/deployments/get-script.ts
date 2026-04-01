import {
  unwrapDocument,
  jsonApiDocumentSchema,
  DeploymentScriptAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { GetDeploymentScriptOptions } from "./types.ts";

/**
 * Get the deployment script for a site.
 */
export async function getDeploymentScript(
  options: GetDeploymentScriptOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<string>> {
  const response = await request(
    ROUTES.deployments.getScript,
    ctx,
    { server_id: options.server_id, site_id: options.site_id },
    { schema: jsonApiDocumentSchema(DeploymentScriptAttributesSchema) },
  );
  const result = unwrapDocument(response);

  return {
    data: result.content,
  };
}
