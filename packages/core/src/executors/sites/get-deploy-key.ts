import type { DeployKeyAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  DeployKeyAttributesSchema,
} from "@studiometa/forge-api";

import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { SiteDeployKeyOptions } from "./types.ts";

/**
 * Get the deploy key of a site: the public key that the git host must accept.
 */
export async function getSiteDeployKey(
  options: SiteDeployKeyOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<DeployKeyAttributes & { id: number }>> {
  const response = await request(
    ROUTES.sites.getDeployKey,
    ctx,
    { server_id: options.server_id, site_id: options.site_id },
    { schema: jsonApiDocumentSchema(DeployKeyAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
