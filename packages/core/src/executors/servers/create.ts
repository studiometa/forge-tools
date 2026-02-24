import type { ForgeServer, ServerResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { CreateServerOptions } from "./types.ts";

/**
 * Create a new server.
 */
export async function createServer(
  options: CreateServerOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeServer>> {
  const response = await ctx.client.post<ServerResponse>("/servers", options);
  const server = response.server;

  return {
    data: server,
  };
}
