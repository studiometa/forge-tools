import type { SiteAttributes } from "@studiometa/forge-api";
import { SiteAttributesSchema, jsonApiDocumentSchema, unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { CreateLoadBalancerSiteOptions } from "./types.ts";

/**
 * Create a site on a load balancer, with the servers that it sends traffic to.
 * Forge installs the site in the background: its status is `installing` at first.
 */
export async function createLoadBalancerSite(
  options: CreateLoadBalancerSiteOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<SiteAttributes & { id: number }>> {
  const { server_id, ...data } = options;
  const response = await request(
    ROUTES.loadBalancing.createSite,
    ctx,
    { server_id },
    { body: data, schema: jsonApiDocumentSchema(SiteAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
