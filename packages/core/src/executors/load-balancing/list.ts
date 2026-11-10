import type { LoadBalancingNodeAttributes } from "@studiometa/forge-api";
import { LoadBalancingNodeAttributesSchema } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES } from "../../routes.ts";
import { listAllPages } from "../../utils/list-all-pages.ts";

import type { ListLoadBalancingNodesOptions } from "./types.ts";

/**
 * List the servers that a site of a load balancer sends traffic to.
 */
export async function listLoadBalancingNodes(
  options: ListLoadBalancingNodesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<LoadBalancingNodeAttributes & { id: number }>>> {
  return {
    data: await listAllPages(
      ROUTES.loadBalancing.list,
      ctx,
      { server_id: options.server_id, site_id: options.site_id },
      LoadBalancingNodeAttributesSchema,
    ),
  };
}
