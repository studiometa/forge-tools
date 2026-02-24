import type { ForgeServer, ServersResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * List all servers.
 */
export async function listServers(
  _options: Record<string, never>,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeServer[]>> {
  const response = await ctx.client.get<ServersResponse>("/servers");
  const servers = response.servers;

  return {
    data: servers,
  };
}
