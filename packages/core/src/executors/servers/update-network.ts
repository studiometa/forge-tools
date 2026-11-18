import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { UpdateServerNetworkOptions } from "./types.ts";

/**
 * Set the network of a server: the list of server IDs replaces the current one.
 */
export async function updateServerNetwork(
  options: UpdateServerNetworkOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  const { server_id, ...data } = options;
  await request(ROUTES.servers.updateNetwork, ctx, { server_id }, { body: data });

  return {
    data: undefined,
  };
}
