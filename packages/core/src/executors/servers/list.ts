import type { ForgeServer, ServersResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { ListServersOptions } from "./types.ts";

/**
 * List all servers.
 */
export async function listServers(
  _options: ListServersOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeServer[]>> {
  const response = await ctx.client.get<ServersResponse>("/servers");
  const servers = response.servers;

  const lines = servers.map(
    (s) =>
      `• ${s.name} (ID: ${s.id}) — ${s.provider} ${s.region} — ${s.ip_address} — ${s.is_ready ? "ready" : "provisioning"}`,
  );

  return {
    data: servers,
    text:
      servers.length > 0
        ? `${servers.length} server(s):\n${lines.join("\n")}`
        : "No servers found.",
  };
}
