import type { ServerAttributes } from "@studiometa/forge-api";

import * as v from "valibot";
import {
  unwrapResource,
  jsonApiResourceSchema,
  ServerAttributesSchema,
} from "@studiometa/forge-api";

import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { GetServerNetworkOptions } from "./types.ts";

/** Forge lists the servers of a network in one page, without pagination links. */
const NetworkSchema = v.object({
  data: v.array(jsonApiResourceSchema(ServerAttributesSchema)),
});

/**
 * List the servers in the network of a server: the servers it can reach on their private IP.
 */
export async function getServerNetwork(
  options: GetServerNetworkOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<ServerAttributes & { id: number }>>> {
  const response = await request(
    ROUTES.servers.getNetwork,
    ctx,
    { server_id: options.server_id },
    { schema: NetworkSchema },
  );

  return {
    data: response.data.map(unwrapResource),
  };
}
