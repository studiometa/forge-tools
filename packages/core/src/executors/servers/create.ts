import type { CreateServerData, ForgeServer, ServerResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * Create a new server.
 */
export async function createServer(
  options: CreateServerData,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeServer>> {
  const response = await ctx.client.post<ServerResponse>("/servers", options);
  const server = response.server;

  return {
    data: server,
  };
}
