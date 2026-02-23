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
    text: [
      `Server: ${server.name} (ID: ${server.id})`,
      `Provider: ${server.provider} (${server.region})`,
      `IP: ${server.ip_address}`,
      `PHP: ${server.php_version}`,
      `Ubuntu: ${server.ubuntu_version}`,
      `Status: ${server.is_ready ? "ready" : "provisioning"}`,
      `Created: ${server.created_at}`,
    ].join("\n"),
  };
}
