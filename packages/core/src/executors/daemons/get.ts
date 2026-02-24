import type { DaemonResponse, ForgeDaemon } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { GetDaemonOptions } from "./types.ts";

/**
 * Get a single daemon.
 */
export async function getDaemon(
  options: GetDaemonOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeDaemon>> {
  const response = await ctx.client.get<DaemonResponse>(
    `/servers/${options.server_id}/daemons/${options.id}`,
  );
  const daemon = response.daemon;

  return {
    data: daemon,
    text: `Daemon: ${daemon.command} (ID: ${daemon.id})\nUser: ${daemon.user}\nProcesses: ${daemon.processes}\nStatus: ${daemon.status}`,
  };
}
