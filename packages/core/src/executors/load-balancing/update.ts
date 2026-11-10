import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { UpdateLoadBalancingNodesOptions } from "./types.ts";

/**
 * Replace the servers that a site of a load balancer sends traffic to.
 * Forge rewrites the upstream of the site and reloads Nginx.
 */
export async function updateLoadBalancingNodes(
  options: UpdateLoadBalancingNodesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  const { server_id, site_id, ...data } = options;
  await request(ROUTES.loadBalancing.update, ctx, { server_id, site_id }, { body: data });

  return {
    data: undefined,
  };
}
