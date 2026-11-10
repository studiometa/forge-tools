/**
 * Option types for load balancing executors.
 */

import type { UpdateLoadBalancingNodesData } from "@studiometa/forge-api";

/**
 * Options for listing the nodes of a site on a load balancer.
 */
export interface ListLoadBalancingNodesOptions {
  server_id: string;
  site_id: string;
}

/**
 * Options for replacing the nodes of a site on a load balancer.
 */
export interface UpdateLoadBalancingNodesOptions extends UpdateLoadBalancingNodesData {
  server_id: string;
  site_id: string;
}
