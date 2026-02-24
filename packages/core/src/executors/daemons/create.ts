import type { DaemonResponse, ForgeDaemon } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { CreateDaemonOptions } from "./types.ts";

/**
 * Create a new daemon (background process).
 */
export async function createDaemon(
  options: CreateDaemonOptions,
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
