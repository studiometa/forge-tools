import type { CreateDaemonData, DaemonResponse, ForgeDaemon } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * Create a new daemon (background process).
 */
export async function createDaemon(
  options: { server_id: string } & CreateDaemonData,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeDaemon>> {
  const { server_id, ...data } = options;
  const response = await ctx.client.post<DaemonResponse>(`/servers/${server_id}/daemons`, data);
  const daemon = response.daemon;

  return {
    data: daemon,
    text: `Daemon created: ${daemon.command} (ID: ${daemon.id})`,
  };
}
