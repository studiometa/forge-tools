import type { ForgeServer, ServerResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export interface GetServerOptions {
  server_id: string;
}

/**
 * Get a specific server by ID.
 */
export async function getServer(
  options: GetServerOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeServer>> {
  const response = await ctx.client.get<ServerResponse>(`/servers/${options.server_id}`);
  const server = response.server;

  return {
    data: server,
  };
}
